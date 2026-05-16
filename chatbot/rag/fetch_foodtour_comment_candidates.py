"""Fetch comments for cleaned foodtour candidates via Apify.

This script is intentionally batch-oriented and writes reviewable output only.
It does not import into MongoDB.
"""

import argparse
import json
import os
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

try:
    from dotenv import load_dotenv
except Exception:  # pragma: no cover
    load_dotenv = None

CURRENT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = CURRENT_DIR.parent
WORKSPACE_ROOT = PROJECT_ROOT.parent
DEFAULT_OUTPUT_DIR = CURRENT_DIR / "outputs" / "foodtour_cleaning"
DEFAULT_CANDIDATES = DEFAULT_OUTPUT_DIR / "foodtour_comment_fetch_candidates.json"
DEFAULT_CLEAN_POSTS = DEFAULT_OUTPUT_DIR / "foodtour_clean_posts_pending_review.json"
DEFAULT_ACTOR_ID = "apify/facebook-comments-scraper"

if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

from collect_facebook_comments_apify import (  # noqa: E402
    cached_comments,
    fetch_comments_from_apify,
    normalize_comment,
    normalize_text,
    save_cache,
    sentiment_summary,
)


def load_environment() -> None:
    if load_dotenv is None:
        return
    for path in [
        PROJECT_ROOT / ".env",
        WORKSPACE_ROOT / "server" / ".env",
        WORKSPACE_ROOT / ".env",
    ]:
        if path.exists():
            load_dotenv(path)
    load_dotenv()


def load_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8-sig") as f:
        return json.load(f)


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", errors="replace") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)


def stable_post_id(candidate: Dict[str, Any]) -> str:
    legacy = normalize_text(candidate.get("postLegacyId"))
    if legacy:
        return f"fb_{legacy}"
    url = normalize_text(candidate.get("postUrl"))
    match = re.search(r"/(?:permalink|posts)/(\d+)", url)
    if match:
        return f"fb_{match.group(1)}"
    return "fb_url_" + str(abs(hash(url)))


def clean_key(url: str) -> str:
    return normalize_text(url).replace("?__cft__", "").rstrip("/")


def build_clean_post_lookup(clean_payload: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
    lookup: Dict[str, Dict[str, Any]] = {}
    for record in clean_payload.get("records") or []:
        if not isinstance(record, dict):
            continue
        source = record.get("source") if isinstance(record.get("source"), dict) else {}
        url = clean_key(str(source.get("postUrl") or ""))
        if url:
            lookup[url] = record
    return lookup


def ratio(numerator: int, denominator: int) -> float:
    if denominator <= 0:
        return 0.0
    return round(numerator / denominator, 4)


SPAM_PATTERNS = [
    r"\bb[áa]n\s+(nh[àa]|[đd][ấa]t|c[aă]n\s+h[ộo]|chung\s+c[ưu]|ccmn)",
    r"b[ấa]t\s+[đd][ộo]ng\s+s[ảa]n",
    r"s[ổo]\s+(h[ồo]ng|[đd][ỏo])",
    r"\b\d+(\.\d+)?\s*t[ỷy]\b",
    r"m[tăặ]t\s+ti[ềe]n",
    r"[ôo]\s*t[ôo]\s+tr[áa]nh",
    r"ph[oò]ng\s+ng[ủu]",
    r"pccc",
    r"zalo\s*\d{7,}",
    r"li[êe]n\s+h[ệe].*\d{7,}",
    r"tuy[ểe]n\s+(d[uụ]ng|nh[âa]n\s+vi[êe]n)",
    r"vi[ệe]c\s+l[àa]m",
    r"inbox|ib\s+(m[ìi]nh|em|shop)",
]

TAG_OR_INVITE_PATTERNS = [
    r"^[A-ZÀ-Ỵ][\wÀ-Ỵà-ỵ.' -]{2,40}\s+(đi|[đd]iii|tri[ểe]n|nh[ăa]m|k[aà]|n[èe]|[ơo]i|iu|c\s+iu).{0,25}$",
    r"^@[^\s]+(\s+@[^\s]+){0,5}$",
]


def spam_reason(text: str) -> Optional[str]:
    lowered = normalize_text(text).casefold()
    if len(lowered) < 8:
        return "too_short"
    if re.fullmatch(r"[\W_]+", lowered):
        return "punctuation_only"
    for pattern in SPAM_PATTERNS:
        if re.search(pattern, lowered, flags=re.IGNORECASE):
            return "spam_or_ad"
    for pattern in TAG_OR_INVITE_PATTERNS:
        if re.search(pattern, text.strip(), flags=re.IGNORECASE):
            return "tag_or_invite_only"
    # Comments without a food/review signal are kept for display but excluded from sentiment.
    if len(lowered.split()) <= 5 and not re.search(
        r"ngon|d[ởo]|d[ơo]|t[ệe]|ch[áa]n|[đd][ắa]t|r[ẻe]|s[ạa]ch|b[ẩa]n|xinh|[ổo]n|ưng|th[íi]ch|qu[áa]n|m[oó]n|gi[áa]",
        lowered,
        flags=re.IGNORECASE,
    ):
        return "low_signal"
    return None


def annotate_and_filter_comments(comments: List[Dict[str, Any]]) -> tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    annotated: List[Dict[str, Any]] = []
    valid: List[Dict[str, Any]] = []
    for comment in comments:
        reason = spam_reason(str(comment.get("text") or ""))
        enriched = dict(comment)
        enriched["isSpam"] = reason is not None
        enriched["spamReason"] = reason
        annotated.append(enriched)
        if reason is None:
            valid.append(enriched)
    return annotated, valid


def top_comments(comments: List[Dict[str, Any]], sentiment: str, limit: int = 3) -> List[str]:
    selected = [
        c
        for c in comments
        if c.get("sentiment") == sentiment and normalize_text(c.get("text"))
    ]
    selected.sort(key=lambda c: (int(c.get("likesCount") or 0), len(normalize_text(c.get("text")))), reverse=True)
    return [normalize_text(c.get("text"))[:500] for c in selected[:limit]]


def comment_sentiment_payload(comments: List[Dict[str, Any]]) -> Dict[str, Any]:
    summary = sentiment_summary(comments)
    positive = int(summary.get("positive") or 0)
    negative = int(summary.get("negative") or 0)
    mixed = int(summary.get("mixed") or 0)
    neutral = int(summary.get("neutral") or 0)
    valid_count = positive + negative + mixed + neutral

    positive_signal = positive + mixed
    negative_signal = negative + mixed
    positive_ratio = ratio(positive_signal, valid_count)
    negative_ratio = ratio(negative_signal, valid_count)

    if valid_count < 5:
        label = "insufficient_comment_signal"
    elif negative_ratio >= 0.6:
        label = "mostly_negative"
    elif positive_ratio >= 0.6:
        label = "mostly_positive"
    elif positive_signal or negative_signal:
        label = "mixed"
    else:
        label = "neutral"

    return {
        "label": label,
        "validCommentCount": valid_count,
        "positiveCount": positive,
        "negativeCount": negative,
        "neutralCount": neutral,
        "mixedCount": mixed,
        "positiveRatio": positive_ratio,
        "negativeRatio": negative_ratio,
        "topPositiveComments": top_comments(comments, "positive"),
        "topNegativeComments": top_comments(comments, "negative"),
        "analyzedAt": datetime.now(timezone.utc).isoformat(),
        "model": "rule_based_v1",
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Fetch comments for cleaned foodtour candidates")
    parser.add_argument("--candidates", default=str(DEFAULT_CANDIDATES))
    parser.add_argument("--clean-posts", default=str(DEFAULT_CLEAN_POSTS))
    parser.add_argument("--output-dir", default=str(DEFAULT_OUTPUT_DIR))
    parser.add_argument("--actor-id", default=os.getenv("APIFY_FACEBOOK_COMMENTS_ACTOR", DEFAULT_ACTOR_ID))
    parser.add_argument("--limit", type=int, default=5)
    parser.add_argument("--offset", type=int, default=0)
    parser.add_argument("--comments-per-post", type=int, default=20)
    parser.add_argument("--timeout-seconds", type=int, default=180)
    parser.add_argument("--sleep-seconds", type=float, default=1.0)
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--fallback-existing-top-comments", action="store_true")
    args = parser.parse_args()

    load_environment()
    token = os.getenv("APIFY_API_TOKEN") or os.getenv("APIFY_TOKEN")
    if not token:
        raise SystemExit("Missing APIFY_API_TOKEN or APIFY_TOKEN.")

    candidates_payload = load_json(Path(args.candidates))
    clean_payload = load_json(Path(args.clean_posts))
    clean_lookup = build_clean_post_lookup(clean_payload)

    candidates = candidates_payload.get("candidates") or []
    if not isinstance(candidates, list):
        candidates = []
    selected = candidates[args.offset : args.offset + args.limit]

    output_dir = Path(args.output_dir)
    cache_dir = output_dir / "apify_comments_cache"
    cache_dir.mkdir(parents=True, exist_ok=True)

    enriched_posts: List[Dict[str, Any]] = []
    enriched_records: List[Dict[str, Any]] = []
    errors: List[Dict[str, Any]] = []

    for idx, candidate in enumerate(selected, 1):
        if not isinstance(candidate, dict):
            continue
        url = normalize_text(candidate.get("postUrl"))
        post_id = stable_post_id(candidate)
        cache_post = {"_post_id": post_id, "url": url}
        cached = None if args.force else cached_comments(cache_dir, post_id)
        if cached is not None:
            comments = cached
            source = "cache"
        else:
            try:
                comments = fetch_comments_from_apify(
                    url=url,
                    token=token,
                    actor_id=args.actor_id,
                    results_limit=args.comments_per_post,
                    timeout_seconds=args.timeout_seconds,
                )
                save_cache(cache_dir, cache_post, comments)
                source = "apify"
                time.sleep(max(0.0, args.sleep_seconds))
            except Exception as exc:
                clean_record_for_fallback = clean_lookup.get(clean_key(url)) or {}
                raw_payload = clean_record_for_fallback.get("rawPayload")
                top_comments = []
                if isinstance(raw_payload, dict) and isinstance(raw_payload.get("topComments"), list):
                    top_comments = [
                        comment
                        for comment in (normalize_comment(item) for item in raw_payload.get("topComments") or [])
                        if comment
                    ]
                if args.fallback_existing_top_comments and top_comments:
                    comments = top_comments
                    source = "existing_topComments"
                    errors.append(
                        {
                            "post_id": post_id,
                            "url": url,
                            "title": candidate.get("title"),
                            "error": str(exc),
                            "fallback": "existing_topComments",
                            "fallbackCommentCount": len(top_comments),
                        }
                    )
                    print(f"[warn] {post_id} Apify failed, using {len(top_comments)} existing topComments")
                else:
                    error = {"post_id": post_id, "url": url, "title": candidate.get("title"), "error": str(exc)}
                    errors.append(error)
                    print(f"[warn] {post_id} failed: {exc}")
                    continue

        annotated_comments, valid_comments = annotate_and_filter_comments(comments)
        sentiment = comment_sentiment_payload(valid_comments)
        sentiment["rawCommentCount"] = len(comments)
        sentiment["spamFilteredCount"] = len(annotated_comments) - len(valid_comments)
        sentiment["spamReasons"] = {}
        for comment in annotated_comments:
            reason = comment.get("spamReason")
            if reason:
                sentiment["spamReasons"][reason] = sentiment["spamReasons"].get(reason, 0) + 1
        clean_record = clean_lookup.get(clean_key(url))
        enriched_post = {
            "post_id": post_id,
            "source_url": url,
            "title": candidate.get("title"),
            "postType": candidate.get("postType"),
            "priority": candidate.get("priority"),
            "fetchReason": candidate.get("reason"),
            "declaredCommentsCount": candidate.get("commentsCount"),
            "fetchedCommentsCount": len(comments),
            "validCommentsCount": len(valid_comments),
            "spamFilteredCount": len(annotated_comments) - len(valid_comments),
            "comment_source": source,
            "commentSentiment": sentiment,
            "comments": annotated_comments,
            "validComments": valid_comments,
        }
        enriched_posts.append(enriched_post)

        if clean_record:
            updated = dict(clean_record)
            updated["commentFetchPlan"] = {
                **(updated.get("commentFetchPlan") if isinstance(updated.get("commentFetchPlan"), dict) else {}),
                "fetchRecommended": True,
                "priority": candidate.get("priority", 0),
                "reason": candidate.get("reason"),
                "postUrl": url,
                "commentsCount": candidate.get("commentsCount", 0),
                "status": "fetched",
                "fetchedAt": datetime.now(timezone.utc).isoformat(),
                "commentCountFetched": len(comments),
                "validCommentCount": len(valid_comments),
                "spamFilteredCount": len(annotated_comments) - len(valid_comments),
            }
            updated["commentSentiment"] = sentiment
            updated["comments"] = annotated_comments
            updated["validComments"] = valid_comments
            enriched_records.append(updated)

        print(
            f"[{idx}/{len(selected)}] {post_id} comments={len(comments)} "
            f"valid={len(valid_comments)} spam={len(annotated_comments) - len(valid_comments)} "
            f"source={source} label={sentiment['label']}"
        )

    suffix = f"offset{args.offset}_limit{args.limit}"
    enriched_path = output_dir / f"foodtour_comments_enriched_{suffix}.json"
    records_path = output_dir / f"foodtour_clean_posts_with_comments_{suffix}.json"
    write_json(
        enriched_path,
        {
            "schemaVersion": "foodtour_comments_enriched_v1",
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "candidateSource": str(Path(args.candidates)),
            "cleanPostSource": str(Path(args.clean_posts)),
            "actorId": args.actor_id,
            "offset": args.offset,
            "limit": args.limit,
            "commentsPerPost": args.comments_per_post,
            "enrichedCount": len(enriched_posts),
            "errorCount": len(errors),
            "errors": errors,
            "posts": enriched_posts,
        },
    )
    write_json(
        records_path,
        {
            "schemaVersion": "foodtour_clean_posts_with_comments_v1",
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "sourceCleanPosts": str(Path(args.clean_posts)),
            "records": enriched_records,
        },
    )
    print(f"Output enriched comments: {enriched_path}")
    print(f"Output importable records: {records_path}")


if __name__ == "__main__":
    main()
