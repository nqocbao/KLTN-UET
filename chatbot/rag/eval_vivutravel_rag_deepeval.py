import argparse
import csv
import json
import os
import sys
import time
from dataclasses import dataclass
from statistics import mean
from typing import Any, Dict, Iterable, List, Optional, Tuple

try:
    from dotenv import load_dotenv
except Exception:  # pragma: no cover - optional dependency for local retrieval runs
    def load_dotenv(*_args: Any, **_kwargs: Any) -> bool:
        return False

try:
    from deepeval.metrics import AnswerRelevancyMetric, FaithfulnessMetric
    from deepeval.metrics import ContextualRecallMetric
    from deepeval.test_case import LLMTestCase
except Exception:  # pragma: no cover - optional when --skip-deepeval is used
    AnswerRelevancyMetric = None
    FaithfulnessMetric = None
    ContextualRecallMetric = None
    LLMTestCase = None

try:
    from deepeval.metrics import KnowledgeRetentionMetric
except Exception:  # pragma: no cover - runtime import guard
    KnowledgeRetentionMetric = None

try:
    from deepeval.test_case import ConversationalTestCase
except Exception:  # pragma: no cover - runtime import guard
    ConversationalTestCase = None

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from rag.food_reviews_rag import FoodReviewRagItem, FoodReviewRagService
from rag.answer_generator import (
    AnswerGenerator,
    DEFAULT_DEEPSEEK_BASE_URL,
    build_user_prompt as build_prompt,
    default_answer_model,
    default_answer_provider,
    env_first,
)

DEFAULT_BACKEND_URL = os.getenv("BACKEND_API_URL", "http://localhost:5000")
DEFAULT_OUTPUT_DIR = os.path.join(CURRENT_DIR, "outputs")
ENV_PATH = os.path.join(PROJECT_ROOT, ".env")


def load_environment() -> None:
    if os.path.exists(ENV_PATH):
        load_dotenv(ENV_PATH)
    load_dotenv()


@dataclass
class RagConfig:
    config_id: str
    chunking_method: str
    chunk_size: int
    chunk_overlap: int
    embedding_model: str
    top_k: int
    similarity_threshold: float
    min_chunk_chars: int
    query_k_multiplier: int
    index_dir: Optional[str]
    collection_name: Optional[str]


def load_records(path: str) -> Any:
    with open(path, "r", encoding="utf-8") as f:
        if path.lower().endswith(".json"):
            return json.load(f)
        if path.lower().endswith(".csv"):
            reader = csv.DictReader(f)
            return [row for row in reader]

    raise ValueError("Unsupported file type. Use JSON or CSV.")


def get_list_payload(payload: Any) -> List[Dict[str, Any]]:
    if isinstance(payload, dict):
        for key in ["testcases", "cases", "data", "configs"]:
            if key in payload and isinstance(payload[key], list):
                return payload[key]
    if isinstance(payload, list):
        return [item for item in payload if isinstance(item, dict)]
    return []


def to_int(value: Any, default: int) -> int:
    try:
        return int(float(value))
    except Exception:
        return default


def to_float(value: Any, default: float) -> float:
    try:
        return float(value)
    except Exception:
        return default


def to_threshold(value: Any) -> Optional[float]:
    try:
        return float(value)
    except Exception:
        return None


def parse_expected_ids(raw: Any) -> List[str]:
    if raw is None:
        return []
    if isinstance(raw, list):
        return [str(x).strip() for x in raw if str(x).strip()]
    text = str(raw).strip()
    if not text:
        return []
    if "," in text:
        return [part.strip() for part in text.split(",") if part.strip()]
    if "|" in text:
        return [part.strip() for part in text.split("|") if part.strip()]
    return [text]


def build_doc_id(item: FoodReviewRagItem) -> str:
    if item.review_id and item.chunk_id:
        return f"{item.review_id}#{item.chunk_id}"
    return item.chunk_id or item.review_id or ""


def match_expected(expected_ids: List[str], item: FoodReviewRagItem) -> bool:
    if not expected_ids:
        return False
    doc_id = build_doc_id(item)
    chunk_id = item.chunk_id or ""
    review_id = item.review_id or ""
    for expected in expected_ids:
        exp = expected.strip()
        if not exp:
            continue
        if "#" in exp:
            if exp.lower() == doc_id.lower():
                return True
            continue
        exp_lower = exp.lower()
        if exp_lower in {doc_id.lower(), chunk_id.lower(), review_id.lower()}:
            return True
    return False


def compute_retrieval_metrics(
    expected_ids: List[str],
    retrieved: List[FoodReviewRagItem],
) -> Dict[str, Optional[float]]:
    if not expected_ids:
        return {
            "recall_at_1": None,
            "recall_at_3": None,
            "recall_at_5": None,
            "mrr": None,
        }

    rank: Optional[int] = None
    for idx, item in enumerate(retrieved, 1):
        if match_expected(expected_ids, item):
            rank = idx
            break

    recall_at_1 = 1.0 if rank is not None and rank <= 1 else 0.0
    recall_at_3 = 1.0 if rank is not None and rank <= 3 else 0.0
    recall_at_5 = 1.0 if rank is not None and rank <= 5 else 0.0
    mrr = 1.0 / rank if rank is not None else 0.0

    return {
        "recall_at_1": recall_at_1,
        "recall_at_3": recall_at_3,
        "recall_at_5": recall_at_5,
        "mrr": mrr,
    }


def average(values: Iterable[Optional[float]]) -> Optional[float]:
    items = [v for v in values if isinstance(v, (int, float))]
    if not items:
        return None
    return round(mean(items), 6)


def create_deepeval_model(provider: str, deepeval_model: Optional[str], answer_model: str) -> Any:
    provider = provider.lower().strip()
    if provider == "deepseek":
        from deepeval.models.llms.deepseek_model import DeepSeekModel

        api_key = env_first("DEEPSEEK_API_KEY")
        if not api_key and os.getenv("LLM_PROVIDER", "").lower().strip() == "deepseek":
            api_key = os.getenv("LLM_API_KEY")
        if not api_key:
            raise RuntimeError(
                "Missing DEEPSEEK_API_KEY for DeepEval DeepSeek metrics. "
                "Set DEEPSEEK_API_KEY in chatbot/.env."
            )
        model_name = deepeval_model or answer_model or "deepseek-chat"
        return DeepSeekModel(model=model_name, api_key=api_key, temperature=0.0)
    return deepeval_model


def create_turn_metrics(model: Any) -> List[Any]:
    if ContextualRecallMetric is None:
        raise RuntimeError("ContextualRecallMetric is not available. Upgrade deepeval.")

    metrics: List[Any] = [
        ContextualRecallMetric(model=model) if model else ContextualRecallMetric(),
        FaithfulnessMetric(model=model) if model else FaithfulnessMetric(),
        AnswerRelevancyMetric(model=model) if model else AnswerRelevancyMetric(),
    ]
    return metrics


def load_configs(path: str) -> List[RagConfig]:
    payload = load_records(path)
    raw_configs = get_list_payload(payload)
    configs: List[RagConfig] = []

    for idx, raw in enumerate(raw_configs, 1):
        config_id = str(raw.get("config_id") or raw.get("id") or f"cfg_{idx}")
        chunking_method = str(raw.get("chunking_method") or "sentence")
        chunk_size = to_int(raw.get("chunk_size"), 800)
        chunk_overlap = to_int(raw.get("chunk_overlap"), 120)
        embedding_model = str(
            raw.get("embedding_model")
            or raw.get("model")
            or "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
        )
        top_k = to_int(raw.get("topK") or raw.get("top_k"), 5)
        similarity_threshold = to_float(raw.get("similarity_threshold"), 0.28)
        min_chunk_chars = to_int(raw.get("min_chunk_chars"), 120)
        query_k_multiplier = to_int(raw.get("query_k_multiplier"), 4)
        index_dir = raw.get("index_dir")
        collection_name = raw.get("collection_name")

        configs.append(
            RagConfig(
                config_id=config_id,
                chunking_method=chunking_method,
                chunk_size=chunk_size,
                chunk_overlap=chunk_overlap,
                embedding_model=embedding_model,
                top_k=top_k,
                similarity_threshold=similarity_threshold,
                min_chunk_chars=min_chunk_chars,
                query_k_multiplier=query_k_multiplier,
                index_dir=str(index_dir) if index_dir else None,
                collection_name=str(collection_name) if collection_name else None,
            )
        )

    return configs


def format_context(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, list):
        return "\n".join([str(item).strip() for item in value if str(item).strip()])
    if isinstance(value, dict):
        return json.dumps(value, ensure_ascii=False)
    return str(value).strip()


def normalize_turns(raw_turns: Any) -> List[Dict[str, Any]]:
    if not isinstance(raw_turns, list):
        return []
    turns: List[Dict[str, Any]] = []
    for raw in raw_turns:
        if not isinstance(raw, dict):
            continue
        role = str(raw.get("role") or raw.get("speaker") or "user").lower().strip()
        if role != "user":
            continue
        content = str(raw.get("content") or raw.get("input") or raw.get("user") or "").strip()
        if not content:
            continue
        turns.append(
            {
                "input": content,
                "expected_output_outline": raw.get("expected_assistant_output_outline")
                or raw.get("expected_output_outline")
                or raw.get("expected_output")
                or "",
                "context": raw.get("context"),
            }
        )
    return turns


def parse_retrieval_context(value: Any) -> List[str]:
    if value is None:
        return []
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    if isinstance(value, str):
        text = value.strip()
        return [text] if text else []
    return [format_context(value)] if format_context(value) else []


def load_testcases(path: str) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    payload = load_records(path)
    raw_cases = get_list_payload(payload)

    meta: Dict[str, Any] = {}
    if isinstance(payload, dict):
        meta = {
            "schema_version": payload.get("schema_version"),
            "thresholds": payload.get("thresholds") or {},
        }

    cases: List[Dict[str, Any]] = []
    for idx, raw in enumerate(raw_cases, 1):
        if not isinstance(raw, dict):
            continue

        case_type = str(raw.get("type") or "single_turn").strip().lower()
        if case_type == "conversational" or raw.get("turns"):
            turns = normalize_turns(raw.get("turns"))
            if not turns:
                continue
            cases.append(
                {
                    "case_type": "conversational",
                    "testcase_id": str(raw.get("id") or raw.get("test_id") or f"case_{idx}"),
                    "difficulty": raw.get("difficulty") or "",
                    "domain": raw.get("domain") or "",
                    "scenario": raw.get("scenario") or "",
                    "expected_outcome": raw.get("expected_outcome") or "",
                    "expected_chunk_ids": parse_expected_ids(
                        raw.get("expected_chunk_id") or raw.get("expected_chunk_ids")
                    ),
                    "context": format_context(raw.get("context")),
                    "turns": turns,
                }
            )
            continue

        question = str(raw.get("input") or raw.get("question") or "").strip()
        if not question:
            continue

        cases.append(
            {
                "case_type": "single_turn",
                "testcase_id": str(raw.get("id") or raw.get("test_id") or f"case_{idx}"),
                "difficulty": raw.get("difficulty") or "",
                "question_type": raw.get("question_type") or "",
                "domain": raw.get("domain") or raw.get("category") or "",
                "input": question,
                "expected_output_outline": raw.get("expected_output_outline")
                or raw.get("expected_output")
                or "",
                "expected_chunk_ids": parse_expected_ids(
                    raw.get("expected_chunk_id") or raw.get("expected_chunk_ids")
                ),
                "context": format_context(raw.get("context")),
                "retrieval_context": parse_retrieval_context(raw.get("retrieval_context")),
                "target_metadata": raw.get("target_metadata") or {},
            }
        )

    return cases, meta


def evaluate_turn(
    question: str,
    retrieval_query: str,
    expected_output: str,
    expected_ids: List[str],
    rag_service: FoodReviewRagService,
    answer_generator: AnswerGenerator,
    deepeval_model: Optional[str],
    scenario: str,
    extra_context: str,
    history: List[Tuple[str, str]],
    skip_deepeval: bool,
) -> Tuple[Dict[str, Any], str, float, float]:
    retrieval_start = time.perf_counter()
    items = rag_service.query(retrieval_query or question)
    retrieval_latency_ms = (time.perf_counter() - retrieval_start) * 1000.0

    retrieved_ids = [build_doc_id(item) for item in items]
    retrieved_texts = [item.doc_text or item.summary for item in items if item.doc_text or item.summary]

    retrieval_metrics = compute_retrieval_metrics(expected_ids, items)

    actual_output = ""
    score_map: Dict[str, Optional[float]] = {
        "contextual_recall_score": None,
        "faithfulness_score": None,
        "answer_relevancy_score": None,
    }

    generation_latency_ms = 0.0
    metric_latency_ms = 0.0

    if answer_generator.provider != "none":
        generation_start = time.perf_counter()
        try:
            actual_output = answer_generator.generate(
                question=question,
                contexts=retrieved_texts,
                history=history,
                extra_context=extra_context,
                scenario=scenario,
            )
        except Exception as exc:
            actual_output = ""
            print(f"[warn] Failed to generate answer for '{question[:30]}...': {exc}")
        generation_latency_ms = (time.perf_counter() - generation_start) * 1000.0

    if not skip_deepeval and actual_output:
        metric_start = time.perf_counter()
        try:
            test_case = LLMTestCase(
                input=question,
                actual_output=actual_output,
                expected_output=expected_output,
                retrieval_context=retrieved_texts,
            )
            for metric in create_turn_metrics(deepeval_model):
                try:
                    metric.measure(test_case)
                    score = metric.score
                except Exception as exc:
                    score = None
                    print(f"[warn] Metric {metric.__class__.__name__} failed: {exc}")

                if isinstance(metric, ContextualRecallMetric):
                    score_map["contextual_recall_score"] = score
                elif isinstance(metric, FaithfulnessMetric):
                    score_map["faithfulness_score"] = score
                elif isinstance(metric, AnswerRelevancyMetric):
                    score_map["answer_relevancy_score"] = score
        finally:
            metric_latency_ms = (time.perf_counter() - metric_start) * 1000.0

    rag_latency_ms = retrieval_latency_ms + generation_latency_ms

    detail = {
        "input": question,
        "expected_chunk_id": "|".join(expected_ids),
        "retrieved_chunk_ids": "|".join(retrieved_ids),
        "actual_output": actual_output,
        "contextual_recall_score": score_map["contextual_recall_score"],
        "faithfulness_score": score_map["faithfulness_score"],
        "answer_relevancy_score": score_map["answer_relevancy_score"],
        "recall_at_1": retrieval_metrics["recall_at_1"],
        "recall_at_3": retrieval_metrics["recall_at_3"],
        "recall_at_5": retrieval_metrics["recall_at_5"],
        "mrr": retrieval_metrics["mrr"],
        "latency_ms": round(rag_latency_ms, 3),
        "retrieval_latency_ms": round(retrieval_latency_ms, 3),
        "generation_latency_ms": round(generation_latency_ms, 3),
        "deepeval_latency_ms": round(metric_latency_ms, 3),
    }

    return detail, actual_output, retrieval_latency_ms, generation_latency_ms


def run_config(
    config: RagConfig,
    testcases: List[Dict[str, Any]],
    backend_url: str,
    answer_generator: AnswerGenerator,
    deepeval_model: Optional[str],
    skip_deepeval: bool,
    thresholds: Dict[str, Optional[float]],
    retrieval_query_source: str,
) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    collection_name = config.collection_name or "food_reviews"
    rag_service = FoodReviewRagService(
        backend_url=backend_url,
        model_name=config.embedding_model,
        top_k=config.top_k,
        min_score=config.similarity_threshold,
        chunking_method=config.chunking_method,
        chunk_size=config.chunk_size,
        chunk_overlap=config.chunk_overlap,
        min_chunk_chars=config.min_chunk_chars,
        query_k_multiplier=config.query_k_multiplier,
        index_dir=config.index_dir,
        collection_name=collection_name,
    )

    detail_rows: List[Dict[str, Any]] = []
    for case in testcases:
        case_type = case["case_type"]
        if case_type == "single_turn":
            retrieval_query = case["input"]
            if retrieval_query_source == "context":
                retrieval_contexts = case.get("retrieval_context") or []
                if retrieval_contexts:
                    retrieval_query = retrieval_contexts[0]
                elif case.get("context"):
                    retrieval_query = case.get("context") or retrieval_query

            detail, actual_output, _, _ = evaluate_turn(
                question=case["input"],
                retrieval_query=retrieval_query,
                expected_output=case["expected_output_outline"],
                expected_ids=case["expected_chunk_ids"],
                rag_service=rag_service,
                answer_generator=answer_generator,
                deepeval_model=deepeval_model,
                scenario="",
                extra_context=case.get("context") or "",
                history=[],
                skip_deepeval=skip_deepeval,
            )

            detail_rows.append(
                {
                    "config_id": config.config_id,
                    "testcase_id": case["testcase_id"],
                    "case_type": case_type,
                    "turn_index": 0,
                    "difficulty": case.get("difficulty") or "",
                    "domain": case.get("domain") or "",
                    "question_type": case.get("question_type") or "",
                    "knowledge_retention_score": None,
                    **detail,
                }
            )
            continue

        # Conversational cases
        history: List[Tuple[str, str]] = []
        turn_outputs: List[Dict[str, Any]] = []
        for idx, turn in enumerate(case["turns"], 1):
            retrieval_query = turn["input"]
            if retrieval_query_source == "context":
                turn_context = format_context(turn.get("context")) or case.get("context") or ""
                if turn_context:
                    retrieval_query = turn_context

            detail, actual_output, _, _ = evaluate_turn(
                question=turn["input"],
                retrieval_query=retrieval_query,
                expected_output=turn["expected_output_outline"],
                expected_ids=case["expected_chunk_ids"],
                rag_service=rag_service,
                answer_generator=answer_generator,
                deepeval_model=deepeval_model,
                scenario=case.get("scenario") or "",
                extra_context=format_context(turn.get("context")) or case.get("context") or "",
                history=history,
                skip_deepeval=skip_deepeval,
            )

            history.append((turn["input"], actual_output))
            turn_outputs.append(
                {
                    "config_id": config.config_id,
                    "testcase_id": case["testcase_id"],
                    "case_type": case_type,
                    "turn_index": idx,
                    "difficulty": case.get("difficulty") or "",
                    "domain": case.get("domain") or "",
                    **detail,
                    "scenario": case.get("scenario") or "",
                    "knowledge_retention_score": None,
                }
            )

        knowledge_retention_score: Optional[float] = None
        if not skip_deepeval and KnowledgeRetentionMetric and ConversationalTestCase:
            convo_turns: List[LLMTestCase] = []
            for idx, turn in enumerate(case["turns"]):
                actual_output = ""
                if idx < len(history):
                    actual_output = history[idx][1]
                convo_turns.append(
                    LLMTestCase(
                        input=turn["input"],
                        actual_output=actual_output,
                        expected_output=turn["expected_output_outline"],
                    )
                )

            try:
                convo_case = ConversationalTestCase(turns=convo_turns)
                metric = (
                    KnowledgeRetentionMetric(model=deepeval_model)
                    if deepeval_model
                    else KnowledgeRetentionMetric()
                )
                metric.measure(convo_case)
                knowledge_retention_score = metric.score
            except Exception as exc:
                print(f"[warn] KnowledgeRetentionMetric failed for {case['testcase_id']}: {exc}")

        for row in turn_outputs:
            row["knowledge_retention_score"] = knowledge_retention_score
            detail_rows.append(row)

    detail_rows = apply_thresholds(detail_rows, thresholds)
    summary = build_summary(config, detail_rows, thresholds)
    return detail_rows, summary


def apply_thresholds(
    rows: List[Dict[str, Any]],
    thresholds: Dict[str, Optional[float]],
) -> List[Dict[str, Any]]:
    for row in rows:
        row["contextual_recall_pass"] = score_pass(row.get("contextual_recall_score"), thresholds)
        row["faithfulness_pass"] = score_pass(row.get("faithfulness_score"), thresholds, key="faithfulness")
        row["answer_relevancy_pass"] = score_pass(
            row.get("answer_relevancy_score"), thresholds, key="answer_relevancy"
        )
        row["knowledge_retention_pass"] = score_pass(
            row.get("knowledge_retention_score"), thresholds, key="knowledge_retention"
        )

        pass_flags = [
            row["contextual_recall_pass"],
            row["faithfulness_pass"],
            row["answer_relevancy_pass"],
        ]
        if row.get("case_type") == "conversational":
            pass_flags.append(row["knowledge_retention_pass"])

        known_flags = [flag for flag in pass_flags if flag is not None]
        row["pass_all"] = all(known_flags) if known_flags else None
    return rows


def score_pass(
    score: Optional[float],
    thresholds: Dict[str, Optional[float]],
    key: str = "contextual_recall",
) -> Optional[bool]:
    threshold = thresholds.get(key)
    if score is None or threshold is None:
        return None
    return score >= threshold


def build_summary(
    config: RagConfig,
    detail_rows: List[Dict[str, Any]],
    thresholds: Dict[str, Optional[float]],
) -> Dict[str, Any]:
    rows = [row for row in detail_rows if row.get("config_id") == config.config_id]

    summary = {
        "config_id": config.config_id,
        "chunking_method": config.chunking_method,
        "chunk_size": config.chunk_size,
        "chunk_overlap": config.chunk_overlap,
        "embedding_model": config.embedding_model,
        "topK": config.top_k,
        "similarity_threshold": config.similarity_threshold,
        "average_contextual_recall": average(row.get("contextual_recall_score") for row in rows),
        "average_faithfulness": average(row.get("faithfulness_score") for row in rows),
        "average_answer_relevancy": average(row.get("answer_relevancy_score") for row in rows),
        "average_knowledge_retention": average(row.get("knowledge_retention_score") for row in rows),
        "average_mrr": average(row.get("mrr") for row in rows),
        "average_latency_ms": average(row.get("latency_ms") for row in rows),
    }

    pass_values = [row.get("pass_all") for row in rows if row.get("pass_all") is not None]
    summary["pass_rate"] = round(sum(1 for flag in pass_values if flag) / len(pass_values), 6) if pass_values else None
    summary["thresholds"] = {k: v for k, v in thresholds.items() if v is not None}
    return summary


def write_json(path: str, payload: Any) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)


def write_csv(path: str, rows: List[Dict[str, Any]]) -> None:
    if not rows:
        return
    with open(path, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        for row in rows:
            writer.writerow(row)


def main() -> None:
    load_environment()

    parser = argparse.ArgumentParser(description="Evaluate VivuTravel RAG with DeepEval")
    parser.add_argument("--testcases", required=True, help="Path to JSON/CSV testcases")
    parser.add_argument("--configs", required=True, help="Path to JSON/CSV configs")
    parser.add_argument("--backend-url", default=DEFAULT_BACKEND_URL)
    parser.add_argument("--output-dir", default=DEFAULT_OUTPUT_DIR)
    parser.add_argument("--run-id", default="")
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--llm-provider", default=default_answer_provider())
    parser.add_argument("--llm-model", default=default_answer_model())
    parser.add_argument("--deepeval-model", default=os.getenv("DEEPEVAL_MODEL", ""))
    parser.add_argument("--skip-deepeval", action="store_true")
    parser.add_argument("--threshold-contextual-recall", type=float, default=None)
    parser.add_argument("--threshold-faithfulness", type=float, default=None)
    parser.add_argument("--threshold-answer-relevancy", type=float, default=None)
    parser.add_argument("--threshold-knowledge-retention", type=float, default=None)
    parser.add_argument(
        "--retrieval-query-source",
        choices=["input", "context"],
        default="input",
        help="Use testcase input or source context as retrieval query.",
    )
    args = parser.parse_args()

    configs = load_configs(args.configs)
    if not configs:
        raise SystemExit("No configs found.")

    testcases, meta = load_testcases(args.testcases)
    if args.limit and args.limit > 0:
        testcases = testcases[: args.limit]

    if not testcases:
        raise SystemExit("No testcases found.")

    thresholds = {
        "contextual_recall": to_threshold(args.threshold_contextual_recall),
        "faithfulness": to_threshold(args.threshold_faithfulness),
        "answer_relevancy": to_threshold(args.threshold_answer_relevancy),
        "knowledge_retention": to_threshold(args.threshold_knowledge_retention),
    }

    meta_thresholds = meta.get("thresholds") if isinstance(meta, dict) else {}
    if isinstance(meta_thresholds, dict):
        thresholds = {
            "contextual_recall": thresholds["contextual_recall"]
            if thresholds["contextual_recall"] is not None
            else to_threshold(meta_thresholds.get("contextual_recall")),
            "faithfulness": thresholds["faithfulness"]
            if thresholds["faithfulness"] is not None
            else to_threshold(meta_thresholds.get("faithfulness")),
            "answer_relevancy": thresholds["answer_relevancy"]
            if thresholds["answer_relevancy"] is not None
            else to_threshold(meta_thresholds.get("answer_relevancy")),
            "knowledge_retention": thresholds["knowledge_retention"]
            if thresholds["knowledge_retention"] is not None
            else to_threshold(meta_thresholds.get("knowledge_retention")),
        }

    run_id = args.run_id or time.strftime("%Y%m%d_%H%M%S")
    output_dir = os.path.abspath(args.output_dir)
    os.makedirs(output_dir, exist_ok=True)

    answer_generator = AnswerGenerator(args.llm_provider, args.llm_model)
    deepeval_model = args.deepeval_model or None
    if not deepeval_model and args.llm_provider.lower().strip() in {"gemini", "openai"}:
        deepeval_model = args.llm_model
    deepeval_model = create_deepeval_model(args.llm_provider, deepeval_model, args.llm_model)

    all_details: List[Dict[str, Any]] = []
    summaries: List[Dict[str, Any]] = []

    for config in configs:
        print(f"[run] Config {config.config_id} ({config.embedding_model})")
        details, summary = run_config(
            config=config,
            testcases=testcases,
            backend_url=args.backend_url,
            answer_generator=answer_generator,
            deepeval_model=deepeval_model,
            skip_deepeval=args.skip_deepeval,
            thresholds=thresholds,
            retrieval_query_source=args.retrieval_query_source,
        )
        all_details.extend(details)
        summaries.append(summary)

    details_json = os.path.join(output_dir, f"rag_eval_details_{run_id}.json")
    details_csv = os.path.join(output_dir, f"rag_eval_details_{run_id}.csv")
    summary_json = os.path.join(output_dir, f"rag_eval_summary_{run_id}.json")
    summary_csv = os.path.join(output_dir, f"rag_eval_summary_{run_id}.csv")

    write_json(details_json, all_details)
    write_csv(details_csv, all_details)
    write_json(summary_json, summaries)
    write_csv(summary_csv, summaries)

    print(f"[done] Details: {details_json}")
    print(f"[done] Summary: {summary_json}")


if __name__ == "__main__":
    main()
