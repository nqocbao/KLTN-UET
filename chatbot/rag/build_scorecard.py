"""Build a scorecard JSON from a DeepEval details file.

Mirrors the structure of rag_eval_scorecard_foodtour_clean_deepeval_100_deepseek.json
so the new stratified run can be reported with the same fields.
"""

from __future__ import annotations

import argparse
import json
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from statistics import mean
from typing import Any, Dict, List, Optional


def avg(values: List[Optional[float]]) -> Optional[float]:
    cleaned = [v for v in values if isinstance(v, (int, float))]
    if not cleaned:
        return None
    return mean(cleaned)


def pass_rate(values: List[Optional[float]], threshold: float) -> Optional[float]:
    valid = [v for v in values if isinstance(v, (int, float))]
    if not valid:
        return None
    return sum(1 for v in valid if v >= threshold) / len(valid)


def case_composite(row: Dict[str, Any]) -> Optional[float]:
    metric_scores = [
        row.get("contextual_recall_score"),
        row.get("faithfulness_score"),
        row.get("answer_relevancy_score"),
    ]
    valid = [v for v in metric_scores if isinstance(v, (int, float))]
    if not valid:
        return None
    return mean(valid)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--details", required=True, help="Path to details JSON")
    parser.add_argument("--out", required=True, help="Path to write scorecard JSON")
    parser.add_argument("--details-augmented", default="", help="Optional path to write details with composite fields")
    parser.add_argument("--run-id", required=True)
    parser.add_argument("--phase", default="single_turn_food_review_rag")
    parser.add_argument("--config-id", default="")
    parser.add_argument("--threshold-cr", type=float, default=0.65)
    parser.add_argument("--threshold-fa", type=float, default=0.70)
    parser.add_argument("--threshold-ar", type=float, default=0.70)
    parser.add_argument("--composite-threshold", type=float, default=0.70)
    parser.add_argument("--notes", nargs="*", default=[])
    args = parser.parse_args()

    details: List[Dict[str, Any]] = json.loads(Path(args.details).read_text(encoding="utf-8"))
    if args.config_id:
        details = [r for r in details if r.get("config_id") == args.config_id]
    config_id = args.config_id or (details[0].get("config_id") if details else "")
    if not details:
        raise SystemExit("No details rows after filtering by config_id")

    cr_scores = [r.get("contextual_recall_score") for r in details]
    fa_scores = [r.get("faithfulness_score") for r in details]
    ar_scores = [r.get("answer_relevancy_score") for r in details]

    cr_mean = avg(cr_scores)
    fa_mean = avg(fa_scores)
    ar_mean = avg(ar_scores)

    cr_pass = pass_rate(cr_scores, args.threshold_cr)
    fa_pass = pass_rate(fa_scores, args.threshold_fa)
    ar_pass = pass_rate(ar_scores, args.threshold_ar)

    composites: List[Optional[float]] = []
    strict_pass: List[bool] = []
    complete_count = 0
    for row in details:
        c = case_composite(row)
        composites.append(c)
        row["case_composite_score"] = round(c, 6) if isinstance(c, (int, float)) else None
        cr = row.get("contextual_recall_score")
        fa = row.get("faithfulness_score")
        ar = row.get("answer_relevancy_score")
        valid_all = all(isinstance(x, (int, float)) for x in (cr, fa, ar))
        row["case_composite_complete"] = valid_all
        if valid_all:
            complete_count += 1
        if isinstance(c, (int, float)):
            row["case_composite_pass"] = c >= args.composite_threshold
        else:
            row["case_composite_pass"] = None
        strict_pass.append(
            valid_all
            and isinstance(cr, (int, float)) and cr >= args.threshold_cr
            and isinstance(fa, (int, float)) and fa >= args.threshold_fa
            and isinstance(ar, (int, float)) and ar >= args.threshold_ar
        )

    composite_mean = avg(composites)
    composite_complete_mean = avg([c for c, valid in zip(composites, [r["case_composite_complete"] for r in details]) if valid])
    composite_pass_count = sum(1 for c in composites if isinstance(c, (int, float)) and c >= args.composite_threshold)
    composite_pass_rate = composite_pass_count / len(details) if details else None
    strict_pass_count = sum(strict_pass)
    strict_pass_rate = strict_pass_count / len(details) if details else None

    recall_at_1 = avg([r.get("recall_at_1") for r in details])
    recall_at_3 = avg([r.get("recall_at_3") for r in details])
    recall_at_5 = avg([r.get("recall_at_5") for r in details])
    mrr = avg([r.get("mrr") for r in details])

    domain_groups: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    for row in details:
        key = row.get("domain") or row.get("question_type") or "unknown"
        domain_groups[key].append(row)

    domain_breakdown: Dict[str, Dict[str, Any]] = {}
    for key, rows in domain_groups.items():
        dom_composites = [case_composite(r) for r in rows]
        domain_breakdown[key] = {
            "cases": len(rows),
            "contextual_recall": avg([r.get("contextual_recall_score") for r in rows]),
            "faithfulness": avg([r.get("faithfulness_score") for r in rows]),
            "answer_relevancy": avg([r.get("answer_relevancy_score") for r in rows]),
            "mrr": avg([r.get("mrr") for r in rows]),
            "recall_at_1": avg([r.get("recall_at_1") for r in rows]),
            "recall_at_3": avg([r.get("recall_at_3") for r in rows]),
            "recall_at_5": avg([r.get("recall_at_5") for r in rows]),
            "case_composite_score": avg(dom_composites),
            "case_composite_pass_rate": (
                sum(1 for c in dom_composites if isinstance(c, (int, float)) and c >= args.composite_threshold)
                / len(rows)
            ) if rows else None,
        }

    difficulties = defaultdict(int)
    domains = defaultdict(int)
    for row in details:
        difficulties[row.get("difficulty") or "unknown"] += 1
        domains[row.get("domain") or row.get("question_type") or "unknown"] += 1

    avg_latency = avg([r.get("latency_ms") for r in details])
    avg_retrieval_latency = avg([r.get("retrieval_latency_ms") for r in details])
    avg_generation_latency = avg([r.get("generation_latency_ms") for r in details])
    avg_deepeval_latency = avg([r.get("deepeval_latency_ms") for r in details])

    scorecard = {
        "run_id": args.run_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "phase": args.phase,
        "summary": {
            "cases": len(details),
            "difficulties": dict(difficulties),
            "domains": dict(domains),
            "config_id": config_id,
        },
        "thresholds": {
            "single_turn": {
                "contextual_recall": args.threshold_cr,
                "faithfulness": args.threshold_fa,
                "answer_relevancy": args.threshold_ar,
                "composite_pass_threshold": args.composite_threshold,
            }
        },
        "scorecard": {
            "included_metrics": ["contextual_recall", "faithfulness", "answer_relevancy"],
            "excluded_metrics": ["knowledge_retention"],
            "weights": {
                "contextual_recall": 1 / 3,
                "faithfulness": 1 / 3,
                "answer_relevancy": 1 / 3,
            },
            "formulas": {
                "metric_mean": "S_m = (1/N_valid) * sum(score_m)",
                "metric_pass_rate": "PassRate_m = (1/N_valid) * sum(1[score_m >= threshold_m])",
                "overall_quality": "Q = average available metric scores per case, then mean across cases",
                "case_composite_score": "Q_case = average of available contextual_recall, faithfulness, answer_relevancy",
                "strict_all_metric_threshold_pass_rate": "Pass only when all three metrics exist and pass thresholds",
            },
            "metric_statistics": {
                "contextual_recall": {
                    "display_name": "Contextual Recall",
                    "sample_size": sum(1 for v in cr_scores if isinstance(v, (int, float))),
                    "missing_count": sum(1 for v in cr_scores if not isinstance(v, (int, float))),
                    "threshold": args.threshold_cr,
                    "mean_score": round(cr_mean, 6) if cr_mean is not None else None,
                    "pass_count": sum(1 for v in cr_scores if isinstance(v, (int, float)) and v >= args.threshold_cr),
                    "pass_rate": round(cr_pass, 6) if cr_pass is not None else None,
                },
                "faithfulness": {
                    "display_name": "Faithfulness",
                    "sample_size": sum(1 for v in fa_scores if isinstance(v, (int, float))),
                    "missing_count": sum(1 for v in fa_scores if not isinstance(v, (int, float))),
                    "threshold": args.threshold_fa,
                    "mean_score": round(fa_mean, 6) if fa_mean is not None else None,
                    "pass_count": sum(1 for v in fa_scores if isinstance(v, (int, float)) and v >= args.threshold_fa),
                    "pass_rate": round(fa_pass, 6) if fa_pass is not None else None,
                },
                "answer_relevancy": {
                    "display_name": "Answer Relevancy",
                    "sample_size": sum(1 for v in ar_scores if isinstance(v, (int, float))),
                    "missing_count": sum(1 for v in ar_scores if not isinstance(v, (int, float))),
                    "threshold": args.threshold_ar,
                    "mean_score": round(ar_mean, 6) if ar_mean is not None else None,
                    "pass_count": sum(1 for v in ar_scores if isinstance(v, (int, float)) and v >= args.threshold_ar),
                    "pass_rate": round(ar_pass, 6) if ar_pass is not None else None,
                },
            },
            "case_composite_statistics": {
                "sample_size": len(details),
                "complete_sample_size": complete_count,
                "composite_threshold": args.composite_threshold,
                "mean_score": round(composite_mean, 6) if composite_mean is not None else None,
                "complete_case_mean_score": round(composite_complete_mean, 6) if composite_complete_mean is not None else None,
                "pass_count": composite_pass_count,
                "pass_rate": round(composite_pass_rate, 6) if composite_pass_rate is not None else None,
                "strict_all_metric_threshold_pass_count": strict_pass_count,
                "strict_all_metric_threshold_pass_rate": round(strict_pass_rate, 6) if strict_pass_rate is not None else None,
            },
            "overall_quality_score": round(composite_mean, 6) if composite_mean is not None else None,
            "overall_quality_percent": round((composite_mean or 0) * 100, 2),
            "complete_case_overall_quality_score": round(composite_complete_mean, 6) if composite_complete_mean is not None else None,
            "complete_case_overall_quality_percent": round((composite_complete_mean or 0) * 100, 2),
            "score_range": "[0, 1]",
        },
        "retrieval": {
            "recall_at_1": round(recall_at_1, 6) if recall_at_1 is not None else None,
            "recall_at_3": round(recall_at_3, 6) if recall_at_3 is not None else None,
            "recall_at_5": round(recall_at_5, 6) if recall_at_5 is not None else None,
            "mrr": round(mrr, 6) if mrr is not None else None,
        },
        "timing": {
            "average_latency_ms": round(avg_latency, 5) if avg_latency is not None else None,
            "average_retrieval_latency_ms": round(avg_retrieval_latency, 5) if avg_retrieval_latency is not None else None,
            "average_generation_latency_ms": round(avg_generation_latency, 5) if avg_generation_latency is not None else None,
            "average_deepeval_latency_ms": round(avg_deepeval_latency, 5) if avg_deepeval_latency is not None else None,
        },
        "domain_breakdown": domain_breakdown,
        "notes": args.notes,
        "details": details,
    }

    Path(args.out).parent.mkdir(parents=True, exist_ok=True)
    Path(args.out).write_text(json.dumps(scorecard, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[done] Wrote scorecard to {args.out}")

    if args.details_augmented:
        Path(args.details_augmented).parent.mkdir(parents=True, exist_ok=True)
        Path(args.details_augmented).write_text(
            json.dumps(details, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        print(f"[done] Wrote augmented details to {args.details_augmented}")


if __name__ == "__main__":
    main()
