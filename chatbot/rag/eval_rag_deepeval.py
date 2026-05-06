import argparse
import csv
import json
import os
import re
import sys
import time
from dataclasses import dataclass
from statistics import mean
from typing import Any, Dict, Iterable, List, Optional, Tuple

from dotenv import load_dotenv
from deepeval.metrics import (
    AnswerRelevancyMetric,
    ContextualRelevancyMetric,
    FaithfulnessMetric,
    HallucinationMetric,
)
from deepeval.test_case import LLMTestCase

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from rag.food_reviews_rag import FoodReviewRagItem, FoodReviewRagService

DEFAULT_BACKEND_URL = os.getenv("BACKEND_API_URL", "http://localhost:5000")
DEFAULT_OUTPUT_DIR = os.path.join(CURRENT_DIR, "outputs")
ENV_PATH = os.path.join(PROJECT_ROOT, ".env")


def load_environment() -> None:
    if os.path.exists(ENV_PATH):
        load_dotenv(ENV_PATH)
    load_dotenv()
    workspace_cache = os.path.join(PROJECT_ROOT, ".cache")
    os.makedirs(workspace_cache, exist_ok=True)
    os.environ.setdefault("HF_HOME", os.path.join(workspace_cache, "huggingface"))
    os.environ.setdefault("TRANSFORMERS_CACHE", os.path.join(workspace_cache, "huggingface", "transformers"))
    os.environ.setdefault("SENTENCE_TRANSFORMERS_HOME", os.path.join(workspace_cache, "sentence_transformers"))
    os.environ.setdefault("ANONYMIZED_TELEMETRY", "False")


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


class AnswerGenerator:
    def __init__(self, provider: str, model: str) -> None:
        self.provider = provider.lower().strip()
        self.model = model
        self._client = None

    def _ensure_client(self) -> None:
        if self._client is not None:
            return

        if self.provider == "openai":
            from openai import OpenAI

            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key and os.getenv("LLM_PROVIDER", "").lower().strip() == "openai":
                api_key = os.getenv("LLM_API_KEY")
            if not api_key:
                raise RuntimeError(
                    "Missing OPENAI_API_KEY for OpenAI provider. "
                    "Set OPENAI_API_KEY in chatbot/.env."
                )
            self._client = OpenAI(api_key=api_key)
        elif self.provider == "gemini":
            import google.generativeai as genai

            api_key = os.getenv("GEMINI_API_KEY")
            if not api_key:
                raise RuntimeError("Missing GEMINI_API_KEY for Gemini provider")
            genai.configure(api_key=api_key)
            self._client = genai
        elif self.provider == "none":
            self._client = None
        else:
            raise RuntimeError(f"Unsupported LLM provider: {self.provider}")

    def generate(self, question: str, contexts: List[str]) -> str:
        if self.provider == "none":
            return ""

        self._ensure_client()
        prompt = build_prompt(question, contexts)

        if self.provider == "openai":
            response = self._client.chat.completions.create(
                model=self.model,
                temperature=0.2,
                messages=[
                    {"role": "system", "content": "You are a helpful travel assistant."},
                    {"role": "user", "content": prompt},
                ],
            )
            content = response.choices[0].message.content or ""
            return content.strip()

        if self.provider == "gemini":
            model = self._client.GenerativeModel(self.model)
            response = model.generate_content(prompt)
            return (response.text or "").strip()

        return ""


def build_prompt(question: str, contexts: List[str]) -> str:
    context_block = "\n\n".join(
        [f"[Chunk {idx + 1}]\n{ctx}" for idx, ctx in enumerate(contexts) if ctx]
    )
    return (
        "Use the following context to answer the question in Vietnamese. "
        "If the answer is not in the context, say you do not know.\n\n"
        f"Context:\n{context_block}\n\n"
        f"Question: {question}\n"
        "Answer:"
    )


def load_records(path: str) -> List[Dict[str, Any]]:
    if path.lower().endswith(".json"):
        with open(path, "r", encoding="utf-8") as f:
            payload = json.load(f)
        if isinstance(payload, dict):
            for key in ["testcases", "cases", "data", "configs"]:
                if key in payload and isinstance(payload[key], list):
                    return payload[key]
        return payload if isinstance(payload, list) else []

    if path.lower().endswith(".csv"):
        with open(path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            return [row for row in reader]

    raise ValueError("Unsupported file type. Use JSON or CSV.")


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


def parse_expected_contexts(raw: Any) -> List[str]:
    if raw is None:
        return []
    if isinstance(raw, list):
        return [str(x).strip() for x in raw if str(x).strip()]
    text = str(raw).strip()
    return [text] if text else []


def normalize_match_text(text: str) -> str:
    return " ".join(text.lower().split())


def match_expected(
    expected_ids: List[str],
    item: FoodReviewRagItem,
    expected_contexts: Optional[List[str]] = None,
) -> bool:
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

    item_text = normalize_match_text(item.doc_text or item.summary or "")
    for expected_context in expected_contexts or []:
        expected_text = normalize_match_text(expected_context)
        if not expected_text or not item_text:
            continue
        if expected_text in item_text or item_text in expected_text:
            return True

    return False


def build_doc_id(item: FoodReviewRagItem) -> str:
    if item.review_id and item.chunk_id:
        return f"{item.review_id}#{item.chunk_id}"
    return item.chunk_id or item.review_id or ""


def config_index_dir(config: RagConfig) -> str:
    if config.index_dir:
        return config.index_dir
    safe_config_id = re.sub(r"[^a-zA-Z0-9_.-]+", "_", config.config_id).strip("_")
    return os.path.join(PROJECT_ROOT, ".rag_eval", safe_config_id or "default")


def compute_retrieval_metrics(
    expected_ids: List[str],
    retrieved: List[FoodReviewRagItem],
    expected_contexts: Optional[List[str]] = None,
) -> Dict[str, Optional[float]]:
    if not expected_ids and not expected_contexts:
        return {
            "Recall@1": None,
            "Recall@3": None,
            "Recall@5": None,
            "MRR": None,
        }

    ranks = []
    for idx, item in enumerate(retrieved, 1):
        if match_expected(expected_ids, item, expected_contexts):
            ranks.append(idx)
            break

    rank = ranks[0] if ranks else None
    recall_at_1 = 1.0 if rank is not None and rank <= 1 else 0.0
    recall_at_3 = 1.0 if rank is not None and rank <= 3 else 0.0
    recall_at_5 = 1.0 if rank is not None and rank <= 5 else 0.0
    mrr = 1.0 / rank if rank is not None else 0.0

    return {
        "Recall@1": recall_at_1,
        "Recall@3": recall_at_3,
        "Recall@5": recall_at_5,
        "MRR": mrr,
    }


def average(values: Iterable[Optional[float]]) -> Optional[float]:
    items = [v for v in values if isinstance(v, (int, float))]
    if not items:
        return None
    return round(mean(items), 6)


def create_metrics(model: Optional[str], enable_hallucination: bool) -> List[Any]:
    metrics: List[Any] = [
        AnswerRelevancyMetric(model=model) if model else AnswerRelevancyMetric(),
        FaithfulnessMetric(model=model) if model else FaithfulnessMetric(),
        ContextualRelevancyMetric(model=model) if model else ContextualRelevancyMetric(),
    ]
    if enable_hallucination:
        metrics.append(HallucinationMetric(model=model) if model else HallucinationMetric())
    return metrics


def load_configs(path: str) -> List[RagConfig]:
    raw_configs = load_records(path)
    configs: List[RagConfig] = []

    for idx, raw in enumerate(raw_configs, 1):
        if not isinstance(raw, dict):
            continue

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


def load_testcases(path: str) -> List[Dict[str, Any]]:
    raw_cases = load_records(path)
    cases: List[Dict[str, Any]] = []

    for idx, raw in enumerate(raw_cases, 1):
        if not isinstance(raw, dict):
            continue
        question = str(raw.get("question") or raw.get("input") or "").strip()
        if not question:
            continue

        cases.append(
            {
                "test_id": str(raw.get("test_id") or raw.get("id") or f"case_{idx}"),
                "question": question,
                "expected_chunk_id": raw.get("expected_chunk_id") or raw.get("expected_chunk_ids"),
                "expected_output": raw.get("expected_output") or raw.get("expected_output_outline"),
                "category": raw.get("category") or raw.get("domain") or "",
                "expected_contexts": parse_expected_contexts(raw.get("retrieval_context")),
            }
        )

    return cases


def run_config(
    config: RagConfig,
    testcases: List[Dict[str, Any]],
    backend_url: str,
    answer_generator: AnswerGenerator,
    deepeval_model: Optional[str],
    enable_hallucination: bool,
    skip_deepeval: bool,
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
        index_dir=config_index_dir(config),
        collection_name=collection_name,
    )

    detail_rows: List[Dict[str, Any]] = []
    retrieval_metrics: Dict[str, List[float]] = {
        "Recall@1": [],
        "Recall@3": [],
        "Recall@5": [],
        "MRR": [],
    }
    latency_values: List[float] = []
    answer_relevancy_scores: List[float] = []
    faithfulness_scores: List[float] = []
    contextual_relevancy_scores: List[float] = []
    hallucination_scores: List[float] = []

    for case in testcases:
        question = case["question"]
        expected_ids = parse_expected_ids(case.get("expected_chunk_id"))
        expected_contexts = case.get("expected_contexts") or []

        start_time = time.perf_counter()
        items = rag_service.query(question)
        latency_ms = (time.perf_counter() - start_time) * 1000.0

        retrieved_ids = [build_doc_id(item) for item in items]
        retrieved_texts = [item.doc_text or item.summary for item in items if item.doc_text or item.summary]

        metrics = compute_retrieval_metrics(expected_ids, items, expected_contexts)
        if metrics["Recall@1"] is not None:
            retrieval_metrics["Recall@1"].append(metrics["Recall@1"])
            retrieval_metrics["Recall@3"].append(metrics["Recall@3"])
            retrieval_metrics["Recall@5"].append(metrics["Recall@5"])
            retrieval_metrics["MRR"].append(metrics["MRR"])

        latency_values.append(latency_ms)

        actual_output = ""
        deepeval_scores: Dict[str, Optional[float]] = {
            "answer_relevancy_score": None,
            "faithfulness_score": None,
            "contextual_relevancy_score": None,
            "hallucination_score": None,
        }

        if not skip_deepeval:
            try:
                actual_output = answer_generator.generate(question, retrieved_texts)
            except Exception as exc:
                actual_output = ""
                print(f"[warn] Failed to generate answer for {case['test_id']}: {exc}")

            if actual_output:
                test_case = LLMTestCase(
                    input=question,
                    actual_output=actual_output,
                    expected_output=case.get("expected_output"),
                    retrieval_context=retrieved_texts,
                )

                metrics_to_run = create_metrics(deepeval_model, enable_hallucination)
                for metric in metrics_to_run:
                    try:
                        metric.measure(test_case)
                        score = metric.score
                    except Exception as exc:
                        score = None
                        print(f"[warn] Metric {metric.__class__.__name__} failed: {exc}")

                    if isinstance(metric, AnswerRelevancyMetric):
                        deepeval_scores["answer_relevancy_score"] = score
                        if isinstance(score, (int, float)):
                            answer_relevancy_scores.append(score)
                    elif isinstance(metric, FaithfulnessMetric):
                        deepeval_scores["faithfulness_score"] = score
                        if isinstance(score, (int, float)):
                            faithfulness_scores.append(score)
                    elif isinstance(metric, ContextualRelevancyMetric):
                        deepeval_scores["contextual_relevancy_score"] = score
                        if isinstance(score, (int, float)):
                            contextual_relevancy_scores.append(score)
                    elif isinstance(metric, HallucinationMetric):
                        deepeval_scores["hallucination_score"] = score
                        if isinstance(score, (int, float)):
                            hallucination_scores.append(score)

        detail_rows.append(
            {
                "config_id": config.config_id,
                "test_id": case["test_id"],
                "category": case.get("category") or "",
                "question": question,
                "expected_chunk_id": case.get("expected_chunk_id") or "",
                "retrieved_chunk_ids": "|".join(retrieved_ids),
                "latency_ms": round(latency_ms, 3),
                **metrics,
                **deepeval_scores,
                "actual_output": actual_output,
                "expected_output": case.get("expected_output") or "",
            }
        )

    summary = {
        "config_id": config.config_id,
        "chunking_method": config.chunking_method,
        "chunk_size": config.chunk_size,
        "chunk_overlap": config.chunk_overlap,
        "embedding_model": config.embedding_model,
        "topK": config.top_k,
        "similarity_threshold": config.similarity_threshold,
        "Recall@1": average(retrieval_metrics["Recall@1"]),
        "Recall@3": average(retrieval_metrics["Recall@3"]),
        "Recall@5": average(retrieval_metrics["Recall@5"]),
        "MRR": average(retrieval_metrics["MRR"]),
        "average_latency_ms": average(latency_values),
        "answer_relevancy_score": average(answer_relevancy_scores),
        "faithfulness_score": average(faithfulness_scores),
        "contextual_relevancy_score": average(contextual_relevancy_scores),
        "hallucination_score": average(hallucination_scores),
    }

    return detail_rows, summary


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


def sort_summary(rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    def key(row: Dict[str, Any]) -> Tuple[float, float, float, float, float]:
        recall_3 = row.get("Recall@3")
        mrr = row.get("MRR")
        faithfulness = row.get("faithfulness_score")
        answer_rel = row.get("answer_relevancy_score")
        latency = row.get("average_latency_ms")

        return (
            -(recall_3 or -1.0),
            -(mrr or -1.0),
            -(faithfulness or -1.0),
            -(answer_rel or -1.0),
            latency if isinstance(latency, (int, float)) else float("inf"),
        )

    return sorted(rows, key=key)


def main() -> None:
    load_environment()

    parser = argparse.ArgumentParser(description="Evaluate RAG configs with DeepEval")
    parser.add_argument("--testcases", required=True, help="Path to JSON/CSV testcases")
    parser.add_argument("--configs", required=True, help="Path to JSON/CSV configs")
    parser.add_argument("--backend-url", default=os.getenv("BACKEND_API_URL", DEFAULT_BACKEND_URL))
    parser.add_argument("--output-dir", default=DEFAULT_OUTPUT_DIR)
    parser.add_argument("--run-id", default="")
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--llm-provider", default=os.getenv("RAG_ANSWER_PROVIDER", "openai"))
    parser.add_argument("--llm-model", default=os.getenv("RAG_ANSWER_MODEL", "gpt-4o-mini"))
    parser.add_argument("--deepeval-model", default=os.getenv("DEEPEVAL_MODEL", ""))
    parser.add_argument("--enable-hallucination", action="store_true")
    parser.add_argument("--skip-deepeval", action="store_true")
    args = parser.parse_args()

    configs = load_configs(args.configs)
    if not configs:
        raise SystemExit("No configs found.")

    testcases = load_testcases(args.testcases)
    if args.limit and args.limit > 0:
        testcases = testcases[: args.limit]

    if not testcases:
        raise SystemExit("No testcases found.")

    run_id = args.run_id or time.strftime("%Y%m%d_%H%M%S")
    output_dir = os.path.abspath(args.output_dir)
    os.makedirs(output_dir, exist_ok=True)

    answer_generator = AnswerGenerator(args.llm_provider, args.llm_model)
    deepeval_model = args.deepeval_model or None
    if not deepeval_model and args.llm_provider.lower().strip() == "gemini":
        deepeval_model = args.llm_model

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
            enable_hallucination=args.enable_hallucination,
            skip_deepeval=args.skip_deepeval,
        )
        all_details.extend(details)
        summaries.append(summary)

    sorted_summaries = sort_summary(summaries)

    details_json = os.path.join(output_dir, f"rag_eval_details_{run_id}.json")
    details_csv = os.path.join(output_dir, f"rag_eval_details_{run_id}.csv")
    summary_json = os.path.join(output_dir, f"rag_eval_summary_{run_id}.json")
    summary_csv = os.path.join(output_dir, f"rag_eval_summary_{run_id}.csv")

    write_json(details_json, all_details)
    write_csv(details_csv, all_details)
    write_json(summary_json, sorted_summaries)
    write_csv(summary_csv, sorted_summaries)

    print(f"[done] Details: {details_json}")
    print(f"[done] Summary: {summary_json}")


if __name__ == "__main__":
    main()
