"""Build RAG testcases from cleaned foodtour records with comment sentiment.

The output is reviewable evaluation data only. It does not call LLMs or write DB.
"""

import argparse
import json
import os
from datetime import datetime, timezone
from typing import Any, Dict, Iterable, List, Optional


CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_INPUT = os.path.join(
    CURRENT_DIR,
    "outputs",
    "foodtour_cleaning",
    "foodtour_clean_posts_with_comments_merged_650.json",
)
DEFAULT_OUTPUT_DIR = os.path.join(CURRENT_DIR, "outputs", "foodtour_clean_eval")

QUOTAS = {
    "mixed_comment": 30,
    "recommendation": 25,
    "complaint_warning": 20,
    "insufficient_comment_signal": 20,
    "promotion_filter": 15,
    "source_citation": 10,
}


def scaled_quotas(limit: int) -> Dict[str, int]:
    base_total = sum(QUOTAS.values())
    if limit <= base_total:
        return dict(QUOTAS)

    weights = {
        "mixed_comment": 0.28,
        "recommendation": 0.22,
        "complaint_warning": 0.16,
        "insufficient_comment_signal": 0.16,
        "promotion_filter": 0.12,
        "source_citation": 0.06,
    }
    quotas = {key: int(limit * weight) for key, weight in weights.items()}
    remainder = limit - sum(quotas.values())
    for key in [
        "mixed_comment",
        "recommendation",
        "complaint_warning",
        "insufficient_comment_signal",
        "promotion_filter",
        "source_citation",
    ]:
        if remainder <= 0:
            break
        quotas[key] += 1
        remainder -= 1
    return quotas


def load_json(path: str) -> Any:
    with open(path, "r", encoding="utf-8-sig") as f:
        return json.load(f)


def write_json(path: str, payload: Any) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8", errors="replace") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)


def safe_text(value: Any) -> str:
    if isinstance(value, str):
        return " ".join(value.replace("\ufeff", " ").split()).strip()
    return ""


def truncate(text: str, limit: int) -> str:
    text = safe_text(text)
    if len(text) <= limit:
        return text
    return text[: max(0, limit - 3)].rstrip() + "..."


def to_int(value: Any) -> int:
    try:
        return int(float(value))
    except Exception:
        return 0


def source_doc_id(record: Dict[str, Any]) -> str:
    source = record.get("source") if isinstance(record.get("source"), dict) else {}
    legacy = safe_text(source.get("postLegacyId"))
    if legacy:
        return f"fb_{legacy}"
    url = safe_text(source.get("postUrl"))
    return "fb_url_" + str(abs(hash(url)))


def source_url(record: Dict[str, Any]) -> str:
    source = record.get("source") if isinstance(record.get("source"), dict) else {}
    return safe_text(source.get("postUrl"))


def city_text(record: Dict[str, Any]) -> str:
    area = record.get("area") if isinstance(record.get("area"), dict) else {}
    return safe_text(area.get("city")) or "chua xac dinh"


def district_text(record: Dict[str, Any]) -> str:
    area = record.get("area") if isinstance(record.get("area"), dict) else {}
    return safe_text(area.get("district"))


def dish_text(record: Dict[str, Any]) -> str:
    tags = record.get("dishTags") if isinstance(record.get("dishTags"), list) else []
    values = [safe_text(tag) for tag in tags if safe_text(tag)]
    return ", ".join(values[:4])


def sentiment(record: Dict[str, Any]) -> Dict[str, Any]:
    value = record.get("commentSentiment")
    return value if isinstance(value, dict) else {}


def sentiment_label(record: Dict[str, Any]) -> str:
    return safe_text(sentiment(record).get("label")) or "not_analyzed"


def post_type(record: Dict[str, Any]) -> str:
    return safe_text(record.get("postType")) or safe_text((record.get("cleaning") or {}).get("postType"))


def valid_comment_count(record: Dict[str, Any]) -> int:
    return to_int(sentiment(record).get("validCommentCount"))


def engagement_score(record: Dict[str, Any]) -> int:
    engagement = record.get("engagement") if isinstance(record.get("engagement"), dict) else {}
    return to_int(engagement.get("score"))


def comment_signal_context(record: Dict[str, Any]) -> str:
    signal = sentiment(record)
    lines: List[str] = []
    label = sentiment_label(record)
    lines.append(f"Nhan sentiment comment: {label}")
    lines.append(
        "Thong ke comment: "
        f"raw={to_int(signal.get('rawCommentCount'))}, "
        f"valid={to_int(signal.get('validCommentCount'))}, "
        f"spam_filtered={to_int(signal.get('spamFilteredCount'))}"
    )

    top_positive = signal.get("topPositiveComments") if isinstance(signal.get("topPositiveComments"), list) else []
    top_negative = signal.get("topNegativeComments") if isinstance(signal.get("topNegativeComments"), list) else []
    top_positive_text = [truncate(text, 180) for text in top_positive if safe_text(text)][:2]
    top_negative_text = [truncate(text, 180) for text in top_negative if safe_text(text)][:2]
    if top_positive_text:
        lines.append("Comment tich cuc noi bat: " + " | ".join(top_positive_text))
    if top_negative_text:
        lines.append("Comment tieu cuc noi bat: " + " | ".join(top_negative_text))

    valid_comments = record.get("validComments") if isinstance(record.get("validComments"), list) else []
    highlights: List[str] = []
    for comment in valid_comments[:4]:
        if not isinstance(comment, dict):
            continue
        text = safe_text(comment.get("text"))
        if not text:
            continue
        highlights.append(f"[{safe_text(comment.get('sentiment')) or 'unknown'}] {truncate(text, 160)}")
    if highlights:
        lines.append("Valid comments: " + " | ".join(highlights))
    return "\n".join(lines)


def retrieval_context(record: Dict[str, Any]) -> str:
    area_bits = ", ".join([part for part in [district_text(record), city_text(record)] if part])
    parts = [
        safe_text(record.get("title")),
        truncate(safe_text(record.get("summary")) or safe_text(record.get("content")), 700),
        f"Khu vuc: {area_bits}" if area_bits else "",
        f"Mon: {dish_text(record)}" if dish_text(record) else "",
        f"Loai bai: {post_type(record)}" if post_type(record) else "",
        comment_signal_context(record),
    ]
    return "\n".join([part for part in parts if part])


def expected_common(record: Dict[str, Any]) -> List[str]:
    points = [
        f"Nguon phai la bai: {safe_text(record.get('title'))}",
        f"Neu neu link nguon thi dung: {source_url(record)}",
        f"Khu vuc: {city_text(record)}",
    ]
    if dish_text(record):
        points.append(f"Mon/tag lien quan: {dish_text(record)}")
    return points


def build_case(
    record: Dict[str, Any],
    category: str,
    index: int,
    question: str,
    expected_points: List[str],
    difficulty: str = "medium",
) -> Dict[str, Any]:
    case_id = f"FTC_{category.upper()}_{index:04d}"
    context = retrieval_context(record)
    expected_output = "Tra loi bang tieng Viet, chi dua tren context. " + " ".join(expected_points)
    return {
        "test_id": case_id,
        "id": case_id,
        "type": "single_turn",
        "input": question,
        "question": question,
        "question_type": category,
        "category": category,
        "difficulty": difficulty,
        "expected_chunk_id": source_doc_id(record),
        "expected_sources": [source_url(record)] if source_url(record) else [],
        "expected_answer_points": expected_points,
        "expected_output": expected_output,
        "source_url": source_url(record),
        "retrieval_context": [context],
        "context": context,
        "target_metadata": {
            "source_doc_id": source_doc_id(record),
            "source_url": source_url(record),
            "legacyId": source_doc_id(record).replace("fb_", "", 1),
            "postType": post_type(record),
            "commentSentimentLabel": sentiment_label(record),
            "validCommentCount": valid_comment_count(record),
            "generated_from_clean_foodtour": True,
        },
    }


def sorted_records(records: Iterable[Dict[str, Any]]) -> List[Dict[str, Any]]:
    return sorted(
        [r for r in records if isinstance(r, dict) and safe_text(r.get("title")) and source_url(r)],
        key=lambda r: (valid_comment_count(r), engagement_score(r), len(safe_text(r.get("content")))),
        reverse=True,
    )


def pick(records: List[Dict[str, Any]], used: set, predicate, limit: int) -> List[Dict[str, Any]]:
    selected = []
    for record in records:
        sid = source_doc_id(record)
        if sid in used:
            continue
        if not predicate(record):
            continue
        selected.append(record)
        used.add(sid)
        if len(selected) >= limit:
            break
    return selected


def question_for(record: Dict[str, Any], category: str) -> str:
    title = truncate(safe_text(record.get("title")), 80)
    city = city_text(record)
    dishes = dish_text(record)
    if category == "mixed_comment":
        return f"Bai review '{title}' co y kien comment trai chieu nhu the nao?"
    if category == "recommendation":
        target = dishes or title
        return f"O {city}, bai nay co goi y mon/quán '{target}' dang thu khong?"
    if category == "complaint_warning":
        return f"Bai '{title}' dang che/canh bao van de gi, co nen can trong khong?"
    if category == "insufficient_comment_signal":
        return f"Voi bai '{title}', co du comment dang tin de ket luan tot/xau khong?"
    if category == "promotion_filter":
        return f"Bai '{title}' la review khach quan hay nghieng ve khuyen mai/quang cao?"
    if category == "source_citation":
        return f"Tom tat bai '{title}' va cho toi link nguon Facebook."
    return f"Tom tat bai '{title}'."


def expected_points_for(record: Dict[str, Any], category: str) -> List[str]:
    points = expected_common(record)
    label = sentiment_label(record)
    points.append(f"Nhãn sentiment comment: {label}")
    points.append(f"So comment hop le sau loc spam: {valid_comment_count(record)}")
    if category == "mixed_comment":
        points.append("Can neu day la bai co y kien comment trai chieu/mixed, khong ket luan mot chieu.")
        points.append("Neu co comment tich cuc va tieu cuc noi bat thi tom tat ca hai mat.")
    elif category == "recommendation":
        points.append("Neu goi y thi phai dua tren noi dung bai va comment, khong bia them trai nghiem.")
    elif category == "complaint_warning":
        points.append("Can neu ro diem bi che/canh bao trong bai, va noi muc do chac chan dua tren context.")
    elif category == "insufficient_comment_signal":
        points.append("Can noi khong du tin hieu comment de ket luan chat luong tong quat.")
    elif category == "promotion_filter":
        points.append("Can nhan dien bai nghieng ve promotion/khuyen mai neu postType la food_promotion.")
    elif category == "source_citation":
        points.append("Can tra link nguon Facebook va tom tat ngan gon.")
    return points


def generate_cases(records: List[Dict[str, Any]], limit: int) -> List[Dict[str, Any]]:
    records = sorted_records(records)
    used: set = set()
    quotas = scaled_quotas(limit)
    buckets = {
        "mixed_comment": pick(
            records,
            used,
            lambda r: sentiment_label(r) == "mixed"
            and post_type(r) != "food_promotion"
            and valid_comment_count(r) >= 6,
            quotas["mixed_comment"],
        ),
        "recommendation": pick(
            records,
            used,
            lambda r: sentiment_label(r) in {"mixed", "mostly_positive", "neutral"}
            and post_type(r) in {"food_review", "food_recommendation"}
            and valid_comment_count(r) >= 5,
            quotas["recommendation"],
        ),
        "complaint_warning": pick(
            records,
            used,
            lambda r: post_type(r) in {"food_complaint", "food_warning"},
            quotas["complaint_warning"],
        ),
        "insufficient_comment_signal": pick(
            records,
            used,
            lambda r: sentiment_label(r) == "insufficient_comment_signal",
            quotas["insufficient_comment_signal"],
        ),
        "promotion_filter": pick(
            records,
            used,
            lambda r: post_type(r) == "food_promotion",
            quotas["promotion_filter"],
        ),
        "source_citation": pick(
            records,
            used,
            lambda r: valid_comment_count(r) >= 5,
            quotas["source_citation"],
        ),
    }

    cases: List[Dict[str, Any]] = []
    for category, selected in buckets.items():
        for record in selected:
            cases.append(
                build_case(
                    record=record,
                    category=category,
                    index=len(cases) + 1,
                    question=question_for(record, category),
                    expected_points=expected_points_for(record, category),
                    difficulty="hard" if category in {"mixed_comment", "promotion_filter"} else "medium",
                )
            )
            if len(cases) >= limit:
                return cases

    if len(cases) < limit:
        for record in records:
            sid = source_doc_id(record)
            if sid in used:
                continue
            category = "general_clean_review"
            cases.append(
                build_case(
                    record=record,
                    category=category,
                    index=len(cases) + 1,
                    question=question_for(record, category),
                    expected_points=expected_points_for(record, category),
                    difficulty="easy",
                )
            )
            used.add(sid)
            if len(cases) >= limit:
                break

    return cases


def summarize_cases(cases: List[Dict[str, Any]]) -> Dict[str, Any]:
    by_category: Dict[str, int] = {}
    by_sentiment: Dict[str, int] = {}
    for case in cases:
        by_category[case["category"]] = by_category.get(case["category"], 0) + 1
        label = safe_text((case.get("target_metadata") or {}).get("commentSentimentLabel"))
        by_sentiment[label] = by_sentiment.get(label, 0) + 1
    return {"count": len(cases), "byCategory": by_category, "bySentiment": by_sentiment}


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate foodtour clean RAG testcases")
    parser.add_argument("--input", default=DEFAULT_INPUT)
    parser.add_argument("--output-dir", default=DEFAULT_OUTPUT_DIR)
    parser.add_argument("--limit", type=int, default=sum(QUOTAS.values()))
    args = parser.parse_args()

    payload = load_json(args.input)
    records = payload.get("records") if isinstance(payload, dict) else payload
    if not isinstance(records, list) or not records:
        raise SystemExit("Input must be a JSON array or an object with records[]")

    cases = generate_cases(records, max(1, args.limit))
    summary = summarize_cases(cases)

    output = {
        "schema_version": "foodtour_clean_comment_testcases_v1",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "source_file": args.input,
        "notes": [
            "Generated from cleaned foodtour records with Apify comments.",
            "Use together with a rebuilt RAG index that includes postType/commentSentiment/validComments.",
        ],
        "summary": summary,
        "testcases": cases,
    }

    output_path = os.path.join(args.output_dir, f"testcases_foodtour_clean_comments_{len(cases)}.json")
    write_json(output_path, output)
    print(json.dumps({"output": output_path, **summary}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
