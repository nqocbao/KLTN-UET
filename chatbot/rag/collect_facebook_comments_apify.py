"""Collect Facebook post comments with Apify for RAG evaluation.

The script is intentionally conservative:
- default mode is a dry run that only selects candidate posts;
- network calls happen only when --fetch is passed;
- fetched comments are cached per post so reruns do not spend Apify credits.
"""

import argparse
import csv
import hashlib
import json
import os
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple

try:
    from dotenv import load_dotenv
except Exception:  # pragma: no cover - optional runtime dependency
    load_dotenv = None


CURRENT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = CURRENT_DIR.parent
DEFAULT_DATA_DIR = Path(r"F:\dataVivutravel")
DEFAULT_OUTPUT_DIR = CURRENT_DIR / "outputs" / "facebook_crawl_eval"
DEFAULT_ACTOR_ID = "apify/facebook-comments-scraper"
DEFAULT_RESULTS_LIMIT = 30

POSITIVE_PATTERNS = [
    r"\bngon\b",
    r"sáº¡ch",
    r"\bá»•n\b",
    r"Æ°ng",
    r"Ä‘á»‰nh",
    r"\bráº»\b",
    r"thÃ­ch",
    r"recommend",
    r"chuáº©n",
    r"tÆ°Æ¡i",
    r"tuyá»‡t",
    r"há»£p lÃ½",
    r"Ä‘Ã¡ng",
]

NEGATIVE_PATTERNS = [
    r"tá»‡",
    r"báº©n",
    r"\bdá»Ÿ\b",
    r"chÃ¡n",
    r"Ä‘áº¯t",
    r"sá»£",
    r"kinh",
    r"khÃ´ng ngon",
    r"tháº¥t vá»ng",
    r"phá»‘t",
    r"ráº¿t",
    r"sÃ¡n",
    r"Ä‘au bá»¥ng",
    r"lá»«a",
    r"máº¥t vá»‡ sinh",
]

OFFTOPIC_PATTERNS = [
    r"tuyá»ƒn",
    r"viá»‡c lÃ m",
    r"bÃ¡n Ä‘áº¥t",
    r"nha khoa",
    r"tai náº¡n",
    r"máº¥t xe",
    r"mÅ© báº£o hiá»ƒm",
    r"limousine",
    r"chuyÃªn xe",
    r"báº¿p chÃ­nh",
]

FOOD_TRAVEL_PATTERNS = [
    r"quÃ¡n",
    r"\bmÃ³n\b",
    r"\bÄƒn\b",
    r"review",
    r"cafe",
    r"cÃ  phÃª",
    r"bÃºn",
    r"phá»Ÿ",
    r"mÃ¬",
    r"miáº¿n",
    r"cÆ¡m",
    r"bÃ¡nh",
    r"láº©u",
    r"nÆ°á»›ng",
    r"buffet",
    r"trÃ  sá»¯a",
    r"homestay",
    r"khÃ¡ch sáº¡n",
    r"villa",
    r"resort",
    r"du thuyá»n",
    r"tour",
]


def normalize_text(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def has_any(text: str, patterns: List[str]) -> bool:
    lowered = text.casefold()
    return any(re.search(pattern, lowered, flags=re.IGNORECASE) for pattern in patterns)


def short_hash(text: str, length: int = 16) -> str:
    return hashlib.sha1(text.encode("utf-8", errors="ignore")).hexdigest()[:length]


def load_environment() -> None:
    if load_dotenv is None:
        return
    env_path = PROJECT_ROOT / ".env"
    if env_path.exists():
        load_dotenv(env_path)
    load_dotenv()


def load_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8-sig") as f:
        return json.load(f)


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)


def write_csv(path: Path, rows: List[Dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if not rows:
        return
    with path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)


def iter_records(payload: Any) -> Iterable[Dict[str, Any]]:
    if isinstance(payload, list):
        for row in payload:
            if isinstance(row, dict):
                yield row
        return
    if isinstance(payload, dict):
        rows = payload.get("data") or payload.get("items") or payload.get("posts") or []
        if isinstance(rows, list):
            for row in rows:
                if isinstance(row, dict):
                    yield row


def stable_post_id(row: Dict[str, Any], text: str) -> str:
    legacy_id = normalize_text(row.get("legacyId"))
    if legacy_id:
        return f"fb_{legacy_id}"
    url = normalize_text(row.get("url") or row.get("facebookUrl"))
    if url:
        match = re.search(r"/(?:permalink|posts)/(\d+)", url)
        if match:
            return f"fb_{match.group(1)}"
        return f"fb_url_{short_hash(url)}"
    return f"fb_text_{short_hash(text)}"


def dedupe_key(row: Dict[str, Any]) -> str:
    return (
        normalize_text(row.get("url"))
        or normalize_text(row.get("facebookUrl"))
        or normalize_text(row.get("legacyId"))
        or short_hash(normalize_text(row.get("text")).casefold(), 24)
    )


def load_posts(data_dir: Path) -> List[Dict[str, Any]]:
    posts: List[Dict[str, Any]] = []
    seen = set()
    for path in sorted(data_dir.glob("*.json")):
        payload = load_json(path)
        for row in iter_records(payload):
            text = normalize_text(row.get("text"))
            if not text:
                continue
            key = dedupe_key(row)
            if key in seen:
                continue
            seen.add(key)
            post = dict(row)
            post["_post_id"] = stable_post_id(row, text)
            post["_source_file"] = path.name
            posts.append(post)
    return posts


def useful_comment_text(value: Any) -> str:
    if isinstance(value, dict):
        text = value.get("text") or value.get("comment") or value.get("message")
    else:
        text = value
    text = normalize_text(text)
    if len(text) < 8:
        return ""
    if re.fullmatch(r"[\W_]+", text):
        return ""
    if text.casefold() in {"up", "upp", "cháº¥m", "."}:
        return ""
    return text


def normalize_comment(item: Any) -> Optional[Dict[str, Any]]:
    text = useful_comment_text(item)
    if not text:
        return None
    if isinstance(item, dict):
        raw_likes = item.get("likesCount") or item.get("likeCount") or 0
        try:
            likes = int(raw_likes)
        except Exception:
            likes = 0
        return {
            "comment_id": normalize_text(item.get("commentId") or item.get("id")),
            "text": text,
            "date": normalize_text(item.get("date") or item.get("timestamp") or item.get("time")),
            "likesCount": likes,
            "profileName": normalize_text(item.get("profileName") or item.get("authorName")),
            "commentUrl": normalize_text(item.get("commentUrl") or item.get("url")),
            "sentiment": classify_sentiment(text),
        }
    return {"comment_id": "", "text": text, "date": "", "likesCount": 0, "profileName": "", "commentUrl": "", "sentiment": classify_sentiment(text)}


def classify_sentiment(text: str) -> str:
    pos = has_any(text, POSITIVE_PATTERNS)
    neg = has_any(text, NEGATIVE_PATTERNS)
    if pos and neg:
        return "mixed"
    if pos:
        return "positive"
    if neg:
        return "negative"
    return "neutral"


def post_url(row: Dict[str, Any]) -> str:
    return normalize_text(row.get("url") or row.get("facebookUrl"))


def candidate_score(row: Dict[str, Any]) -> int:
    text = normalize_text(row.get("text"))
    comments_count = int(row.get("commentsCount") or 0)
    likes_count = int(row.get("likesCount") or row.get("reactionLikeCount") or 0)
    top_comments = row.get("topComments") if isinstance(row.get("topComments"), list) else []
    score = comments_count * 20 + likes_count
    score += len([c for c in top_comments if useful_comment_text(c)]) * 50
    if has_any(text, POSITIVE_PATTERNS):
        score += 20
    if has_any(text, NEGATIVE_PATTERNS):
        score += 20
    if has_any(text, [r"\b\d+\s?k\b", r"giÃ¡", r"menu", r"Ä‘á»‹a chá»‰", r"ship"]):
        score += 10
    return score


def select_candidates(posts: List[Dict[str, Any]], limit: int, min_comments: int) -> List[Dict[str, Any]]:
    candidates = []
    for row in posts:
        text = normalize_text(row.get("text"))
        if not post_url(row):
            continue
        if int(row.get("commentsCount") or 0) < min_comments:
            continue
        if has_any(text, OFFTOPIC_PATTERNS):
            continue
        if not has_any(text, FOOD_TRAVEL_PATTERNS):
            continue
        enriched = dict(row)
        enriched["_candidate_score"] = candidate_score(row)
        candidates.append(enriched)
    candidates.sort(key=lambda row: (-row["_candidate_score"], row["_post_id"]))
    return candidates[:limit]


def apify_actor_url(actor_id: str) -> str:
    actor_path = actor_id.replace("/", "~")
    return f"https://api.apify.com/v2/acts/{actor_path}/run-sync-get-dataset-items"


def fetch_comments_from_apify(
    url: str,
    token: str,
    actor_id: str,
    results_limit: int,
    timeout_seconds: int,
) -> List[Dict[str, Any]]:
    endpoint = apify_actor_url(actor_id)
    query = urllib.parse.urlencode({"token": token})
    request_url = f"{endpoint}?{query}"
    payload = {
        "startUrls": [{"url": url}],
        "resultsLimit": results_limit,
    }
    data = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        request_url,
        data=data,
        method="POST",
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout_seconds) as response:
            body = response.read().decode("utf-8")
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Apify HTTP {exc.code}: {detail[:500]}") from exc
    result = json.loads(body)
    if not isinstance(result, list):
        return []
    comments = []
    for item in result:
        normalized = normalize_comment(item)
        if normalized:
            comments.append(normalized)
    return comments


def cached_comments(cache_dir: Path, post_id: str) -> Optional[List[Dict[str, Any]]]:
    path = cache_dir / f"{post_id}.json"
    if not path.exists():
        return None
    payload = load_json(path)
    comments = payload.get("comments") if isinstance(payload, dict) else payload
    if not isinstance(comments, list):
        return []
    return [comment for comment in comments if isinstance(comment, dict)]


def save_cache(cache_dir: Path, post: Dict[str, Any], comments: List[Dict[str, Any]]) -> None:
    path = cache_dir / f"{post['_post_id']}.json"
    write_json(
        path,
        {
            "post_id": post["_post_id"],
            "source_url": post_url(post),
            "fetched_at": datetime.now(timezone.utc).isoformat(),
            "comments": comments,
        },
    )


def sentiment_summary(comments: List[Dict[str, Any]]) -> Dict[str, int]:
    summary = {"positive": 0, "negative": 0, "mixed": 0, "neutral": 0}
    for comment in comments:
        sentiment = comment.get("sentiment") or "neutral"
        summary[sentiment] = summary.get(sentiment, 0) + 1
    return summary


def testcase_types_for_comments(comments: List[Dict[str, Any]]) -> List[str]:
    summary = sentiment_summary(comments)
    types = ["community_summary"]
    if summary["positive"] or summary["negative"] or summary["mixed"]:
        types.append("worth_trying")
    if summary["negative"] or summary["mixed"]:
        types.append("negative_feedback")
    if summary["positive"] and summary["negative"]:
        types.append("pros_cons")
    return types


def build_enriched_post(post: Dict[str, Any], comments: List[Dict[str, Any]]) -> Dict[str, Any]:
    summary = sentiment_summary(comments)
    return {
        "post_id": post["_post_id"],
        "source_url": post_url(post),
        "groupTitle": normalize_text(post.get("groupTitle")),
        "time": normalize_text(post.get("time")),
        "commentsCount": int(post.get("commentsCount") or 0),
        "likesCount": int(post.get("likesCount") or post.get("reactionLikeCount") or 0),
        "text": normalize_text(post.get("text")),
        "comments": comments,
        "comment_summary": summary,
        "suggested_testcase_types": testcase_types_for_comments(comments),
    }



def post_subject(text: str) -> str:
    text = normalize_text(text)
    first_sentence = re.split(r"[.!?\n]", text, maxsplit=1)[0]
    first_sentence = normalize_text(first_sentence)
    if first_sentence:
        return first_sentence[:90].strip(" -–—:;,")
    return text[:90].strip(" -–—:;,") or "bài review này"


def comment_context(post: Dict[str, Any]) -> str:
    comment_lines = []
    for idx, comment in enumerate(post.get("comments") or [], 1):
        text = normalize_text(comment.get("text"))
        sentiment = comment.get("sentiment") or "neutral"
        likes = comment.get("likesCount") or 0
        if text:
            comment_lines.append(f"[Comment {idx} | {sentiment} | likes={likes}] {text}")
    return ("[POST]\n" + f"{post.get('text', '')}\n\n" + "[COMMENTS]\n" + "\n".join(comment_lines)).strip()


def expected_for_comment_case(post: Dict[str, Any], intent: str) -> str:
    summary = post.get("comment_summary") or {}
    return (
        "Trả lời bằng tiếng Việt, dựa trên nội dung post và comment được cung cấp. "
        f"Loại câu hỏi: {intent}. "
        f"Tóm tắt sentiment comment: positive={summary.get('positive', 0)}, "
        f"negative={summary.get('negative', 0)}, mixed={summary.get('mixed', 0)}, "
        f"neutral={summary.get('neutral', 0)}. "
        "Nếu comment không đủ căn cứ để kết luận ngon/rẻ/đáng thử, phải nói rõ là dữ liệu cộng đồng chưa đủ. "
        "Không bịa thêm trải nghiệm, địa chỉ, giá hoặc món ngoài context."
    )


def build_comment_testcases(enriched_posts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    cases: List[Dict[str, Any]] = []
    case_index = 1
    for post in enriched_posts:
        comments = post.get("comments") or []
        if not comments:
            continue
        subject = post_subject(post.get("text", ""))
        context = comment_context(post)
        source_id = post.get("post_id") or f"post_{case_index}"
        base = {
            "type": "single_turn",
            "difficulty": "medium",
            "domain": "food_comment",
            "expected_chunk_id": source_id,
            "retrieval_context": [context],
            "context": context,
            "target_metadata": {
                "source_doc_id": source_id,
                "source_url": post.get("source_url", ""),
                "groupTitle": post.get("groupTitle", ""),
                "comment_summary": post.get("comment_summary") or {},
            },
        }
        intents = post.get("suggested_testcase_types") or ["community_summary"]
        for intent in intents:
            if intent == "community_summary":
                question = f"Mọi người trong comment nói gì về {subject}?"
            elif intent == "worth_trying":
                question = f"Dựa trên bài viết và comment, {subject} có đáng thử không?"
            elif intent == "negative_feedback":
                question = f"Có comment nào chê hoặc cảnh báo gì về {subject} không?"
            elif intent == "pros_cons":
                question = f"Tổng hợp điểm khen và chê của cộng đồng về {subject} giúp tôi."
            else:
                question = f"Comment cộng đồng nói gì về {subject}?"
            case = dict(base)
            case.update({
                "id": f"FB_COMMENT_{case_index:04d}",
                "test_id": f"FB_COMMENT_{case_index:04d}",
                "question_type": intent,
                "input": question,
                "question": question,
                "expected_output": expected_for_comment_case(post, intent),
            })
            cases.append(case)
            case_index += 1
    return cases

def build_plan_rows(candidates: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    rows = []
    for post in candidates:
        existing_comments = post.get("topComments") if isinstance(post.get("topComments"), list) else []
        useful_existing = [normalize_comment(c) for c in existing_comments]
        useful_existing = [c for c in useful_existing if c]
        rows.append(
            {
                "post_id": post["_post_id"],
                "score": post["_candidate_score"],
                "commentsCount": int(post.get("commentsCount") or 0),
                "existing_topComments": len(useful_existing),
                "groupTitle": normalize_text(post.get("groupTitle")),
                "url": post_url(post),
                "text_preview": normalize_text(post.get("text"))[:220],
            }
        )
    return rows


def main() -> None:
    parser = argparse.ArgumentParser(description="Fetch Facebook comments via Apify for eval testcase enrichment")
    parser.add_argument("--data-dir", default=str(DEFAULT_DATA_DIR))
    parser.add_argument("--output-dir", default=str(DEFAULT_OUTPUT_DIR))
    parser.add_argument("--actor-id", default=os.getenv("APIFY_FACEBOOK_COMMENTS_ACTOR", DEFAULT_ACTOR_ID))
    parser.add_argument("--limit", type=int, default=50, help="Max post candidates to process")
    parser.add_argument("--min-comments", type=int, default=3)
    parser.add_argument("--comments-per-post", type=int, default=DEFAULT_RESULTS_LIMIT)
    parser.add_argument("--timeout-seconds", type=int, default=180)
    parser.add_argument("--sleep-seconds", type=float, default=1.0)
    parser.add_argument("--fetch", action="store_true", help="Actually call Apify. Without this, only writes a plan.")
    parser.add_argument("--force", action="store_true", help="Refetch even if cache exists")
    args = parser.parse_args()

    load_environment()
    data_dir = Path(args.data_dir)
    output_dir = Path(args.output_dir)
    cache_dir = output_dir / "apify_comments_cache"
    output_dir.mkdir(parents=True, exist_ok=True)
    cache_dir.mkdir(parents=True, exist_ok=True)

    posts = load_posts(data_dir)
    candidates = select_candidates(posts, args.limit, args.min_comments)
    plan_rows = build_plan_rows(candidates)
    write_csv(output_dir / "facebook_comment_fetch_plan.csv", plan_rows)
    write_json(
        output_dir / "facebook_comment_fetch_plan.json",
        {
            "schema_version": "facebook_comment_fetch_plan_v1",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "data_dir": str(data_dir),
            "actor_id": args.actor_id,
            "fetch_enabled": args.fetch,
            "candidate_count": len(candidates),
            "candidates": plan_rows,
        },
    )

    if not args.fetch:
        print("Dry run complete. No Apify calls were made.")
        print(f"Candidates: {len(candidates)}")
        print(f"Plan CSV : {output_dir / 'facebook_comment_fetch_plan.csv'}")
        print(f"Plan JSON: {output_dir / 'facebook_comment_fetch_plan.json'}")
        return

    token = os.getenv("APIFY_API_TOKEN") or os.getenv("APIFY_TOKEN")
    if not token:
        raise SystemExit("Missing APIFY_API_TOKEN. Add it to chatbot/.env or set APIFY_TOKEN.")

    enriched_posts = []
    errors = []
    for idx, post in enumerate(candidates, 1):
        cached = None if args.force else cached_comments(cache_dir, post["_post_id"])
        if cached is not None:
            comments = cached
            source = "cache"
        else:
            try:
                comments = fetch_comments_from_apify(
                    url=post_url(post),
                    token=token,
                    actor_id=args.actor_id,
                    results_limit=args.comments_per_post,
                    timeout_seconds=args.timeout_seconds,
                )
                save_cache(cache_dir, post, comments)
                source = "apify"
                time.sleep(max(0.0, args.sleep_seconds))
            except Exception as exc:
                errors.append({"post_id": post["_post_id"], "url": post_url(post), "error": str(exc)})
                print(f"[warn] {post['_post_id']} failed: {exc}")
                continue

        enriched = build_enriched_post(post, comments)
        enriched["comment_source"] = source
        enriched_posts.append(enriched)
        print(f"[{idx}/{len(candidates)}] {post['_post_id']} comments={len(comments)} source={source}")

    payload = {
        "schema_version": "facebook_comments_enriched_posts_v1",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "data_dir": str(data_dir),
        "actor_id": args.actor_id,
        "comments_per_post": args.comments_per_post,
        "candidate_count": len(candidates),
        "enriched_count": len(enriched_posts),
        "error_count": len(errors),
        "errors": errors,
        "posts": enriched_posts,
    }
    output_path = output_dir / "facebook_comments_enriched_posts.json"
    write_json(output_path, payload)
    testcases = build_comment_testcases(enriched_posts)
    testcase_path = output_dir / f"testcases_facebook_comments_enriched_{len(testcases)}.json"
    write_json(
        testcase_path,
        {
            "schema_version": "facebook_comments_enriched_testcases_v1",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "source_enriched_posts": output_path.name,
            "testcases": testcases,
        },
    )
    print(f"Done. Enriched posts: {len(enriched_posts)}")
    print(f"Output: {output_path}")
    print(f"Testcases: {testcase_path}")


if __name__ == "__main__":
    main()



