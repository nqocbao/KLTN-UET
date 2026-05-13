"""Prepare Facebook crawl data for RAG evaluation.

This script does not call LLM APIs. It normalizes local Facebook scraper JSON
files, deduplicates posts, audits existing VivuTravel testcases against the
new crawl corpus, and writes candidate testcase files for later review.
"""

import argparse
import csv
import hashlib
import json
import os
import re
from datetime import datetime, timezone
from typing import Any, Dict, Iterable, List, Optional, Tuple


CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_OUTPUT_DIR = os.path.join(CURRENT_DIR, "outputs", "facebook_crawl_eval")
DEFAULT_EXISTING_TESTCASES = os.path.join(CURRENT_DIR, "testcases_vivutravel_500_mapped.json")
DEFAULT_VERIFIED_STATUSES = ["exact_context", "prefix_120", "prefix_80"]
MIN_ANSWERABLE_CONTEXT_CHARS = 120

UNANSWERABLE_PATTERNS = [
    "không có gì thay đổi",
    "cho e hỏi",
    "cho em hỏi",
    "mọi người cho hỏi",
    "xin quán",
    "xin địa chỉ",
    "ở đâu bán",
    "chỗ nào bán",
    "có ai biết",
    "ai biết",
    "tìm quán",
    "tìm địa chỉ",
    "chuyện ngoài lề",
    "ngoài lề ăn uống",
    "nuôi lợn",
    "móc hết",
    "bị móc",
    "cần lời khuyên",
    "xin lời khuyên",
]

DEFAULT_CRAWL_PATHS = [
    r"C:\Users\NguyenVanNgocBao\Downloads\dataset_facebook-groups-scraper_2026-04-22_04-10-33-799.json",
    r"C:\Users\NguyenVanNgocBao\Downloads\dataset_facebook-groups-scraper_2026-04-22_04-52-13-366.json",
    r"C:\Users\NguyenVanNgocBao\Downloads\dataset_facebook-groups-scraper_2026-04-22_07-05-06-405.json",
    r"C:\Users\NguyenVanNgocBao\Downloads\dataset_facebook-groups-scraper_2026-04-22_07-32-55-963.json",
    r"C:\Users\NguyenVanNgocBao\Downloads\dataset_facebook-groups-scraper_2026-04-21_14-04-20-072.json",
    r"C:\Users\NguyenVanNgocBao\Downloads\dataset_facebook-groups-scraper_2026-04-21_12-55-21-767.json",
]

CITY_HINTS = [
    "Hà Nội",
    "Ha Noi",
    "Sài Gòn",
    "Sai Gon",
    "TP HCM",
    "Hồ Chí Minh",
    "Đà Nẵng",
    "Da Nang",
    "Hải Phòng",
    "Hai Phong",
    "Nha Trang",
    "Phú Quốc",
    "Phu Quoc",
    "Đà Lạt",
    "Da Lat",
    "Huế",
    "Hue",
]

FOOD_KEYWORDS = [
    "ăn",
    "món",
    "quán",
    "bún",
    "phở",
    "cơm",
    "bánh",
    "lẩu",
    "nướng",
    "hải sản",
    "cafe",
    "cà phê",
    "buffet",
    "ghẹ",
    "mỳ",
    "mì",
]

TRAVEL_KEYWORDS = [
    "du lịch",
    "tour",
    "khách sạn",
    "homestay",
    "villa",
    "phòng",
    "resort",
    "vé",
    "cảnh",
    "biển",
    "đảo",
    "cắm trại",
]

EXCLUDE_SEED_KEYWORDS = [
    "khẩn cầu",
    "giúp đỡ",
    "mất xe",
    "mất trộm",
    "kẻ gian",
    "tuyển dụng",
    "tuyển nhân viên",
    "việc làm",
    "xin việc",
    "nhặt được",
    "tìm chủ",
    "chuyển khoản",
    "lừa đảo",
    "tai nạn",
    "ủng hộ",
    "ung ho",
    "bức xúc",
    "buc xuc",
    "mất 1 bên não",
    "mất một bên não",
    "làm tóc",
    "cô gái trẻ",
    "cô bán rau",
    "chuyện ngoài lề",
    "ngoài lề ăn uống",
    "nuôi lợn",
    "móc hết",
    "bị móc",
    "cần lời khuyên",
    "xin lời khuyên",
    "tuyển dụng",
    "tuyển nhân viên",
    "phụ tá",
    "nha khoa",
    "bán đất",
    "chính chủ bán",
    "tai nạn",
    "đỗ bên đường",
    "mất mũ",
    "mũ bảo hiểm",
    "công an",
    "em bé",
    "nôi baby",
    "xe ô tô",
    "xe máy",
    "limousine",
    "chuyên xe",
    "đón trả",
    "làm tóc",
    "tiệm hoa",
]

QUALITY_SEED_KEYWORDS = [
    "review",
    "quán",
    "quan",
    "địa chỉ",
    "dia chi",
    "giá",
    "gia",
    "menu",
    "món",
    "mon",
    "buffet",
    "cafe",
    "cà phê",
    "bún",
    "phở",
    "bánh",
    "cơm",
    "lẩu",
    "nướng",
    "hải sản",
    "homestay",
    "khách sạn",
    "tour",
    "vé",
]


def normalize_text(value: Any) -> str:
    text = str(value or "")
    text = text.replace("\ufeff", "")
    return re.sub(r"\s+", " ", text).strip()


def normalize_for_match(value: Any) -> str:
    return normalize_text(value).casefold()


def short_hash(text: str, length: int = 16) -> str:
    return hashlib.sha1(text.encode("utf-8", errors="ignore")).hexdigest()[:length]


def load_json(path: str) -> Any:
    with open(path, "r", encoding="utf-8-sig") as f:
        return json.load(f)


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


def iter_rows(payload: Any) -> Iterable[Dict[str, Any]]:
    if isinstance(payload, list):
        for row in payload:
            if isinstance(row, dict):
                yield row
        return
    if isinstance(payload, dict):
        data = payload.get("data") or payload.get("items") or payload.get("posts") or []
        if isinstance(data, list):
            for row in data:
                if isinstance(row, dict):
                    yield row


def dedupe_key(row: Dict[str, Any]) -> str:
    text = normalize_for_match(row.get("text"))
    return (
        normalize_text(row.get("url"))
        or normalize_text(row.get("legacyId"))
        or normalize_text(row.get("id"))
        or short_hash(text, 24)
    )


def stable_post_id(row: Dict[str, Any], text: str) -> str:
    legacy_id = normalize_text(row.get("legacyId"))
    if legacy_id:
        return f"fb_{legacy_id}"
    url = normalize_text(row.get("url"))
    if url:
        match = re.search(r"/(?:permalink|posts)/(\d+)", url)
        if match:
            return f"fb_{match.group(1)}"
        return f"fb_url_{short_hash(url, 16)}"
    raw_id = normalize_text(row.get("id"))
    if raw_id:
        return f"fb_id_{short_hash(raw_id, 16)}"
    return f"fb_text_{short_hash(normalize_for_match(text), 16)}"


def first_line(text: str, max_len: int = 140) -> str:
    for line in str(text or "").splitlines():
        clean = normalize_text(line)
        if clean:
            return clean[:max_len]
    return normalize_text(text)[:max_len]


def extract_hashtags(text: str) -> List[str]:
    tags = re.findall(r"(?<!\w)#([\wÀ-ỹ]+)", text or "", flags=re.UNICODE)
    seen = set()
    result = []
    for tag in tags:
        clean = normalize_text(tag)
        key = clean.casefold()
        if clean and key not in seen:
            seen.add(key)
            result.append(clean)
    return result[:20]


def infer_city(text: str, group_title: str) -> str:
    haystack = f"{text}\n{group_title}".casefold()
    for city in CITY_HINTS:
        if city.casefold() in haystack:
            return city
    return ""


def infer_domain(text: str, group_title: str) -> str:
    haystack = f"{text}\n{group_title}".casefold()
    food_hits = sum(1 for keyword in FOOD_KEYWORDS if keyword.casefold() in haystack)
    travel_hits = sum(1 for keyword in TRAVEL_KEYWORDS if keyword.casefold() in haystack)
    if travel_hits and travel_hits >= food_hits:
        if "phòng" in haystack or "homestay" in haystack or "villa" in haystack:
            return "hotel"
        return "travel_experience"
    if food_hits:
        return "food"
    return "other"


def is_seed_candidate(post: Dict[str, Any]) -> bool:
    text = post.get("content") or ""
    group_title = ((post.get("source") or {}).get("groupTitle") or "")
    haystack = f"{text}\n{group_title}".casefold()
    if any(keyword.casefold() in haystack for keyword in EXCLUDE_SEED_KEYWORDS):
        return False
    has_topic = any(keyword.casefold() in haystack for keyword in FOOD_KEYWORDS + TRAVEL_KEYWORDS)
    if not has_topic:
        return False
    text_chars = int((post.get("eval") or {}).get("text_chars") or 0)
    return 80 <= text_chars <= 5000


def seed_quality_score(post: Dict[str, Any]) -> int:
    text = post.get("content") or ""
    title = post.get("title") or ""
    group_title = ((post.get("source") or {}).get("groupTitle") or "")
    haystack = f"{title}\n{text}\n{group_title}".casefold()
    quality_hits = sum(1 for keyword in QUALITY_SEED_KEYWORDS if keyword.casefold() in haystack)
    topic_hits = sum(1 for keyword in FOOD_KEYWORDS + TRAVEL_KEYWORDS if keyword.casefold() in haystack)
    has_url = 1 if ((post.get("source") or {}).get("postUrl") or "") else 0
    text_chars = int((post.get("eval") or {}).get("text_chars") or 0)
    length_bonus = min(text_chars // 250, 8)
    engagement_score = int(((post.get("engagement") or {}).get("score") or 0))
    return quality_hits * 1000 + topic_hits * 100 + has_url * 50 + length_bonus * 10 + min(engagement_score, 50)


def attachment_urls(row: Dict[str, Any]) -> List[str]:
    urls: List[str] = []
    attachments = row.get("attachments") or []
    if not isinstance(attachments, list):
        return urls
    for item in attachments:
        if not isinstance(item, dict):
            continue
        for key in ["url", "thumbnail"]:
            value = normalize_text(item.get(key))
            if value:
                urls.append(value)
        photo_image = item.get("photo_image")
        if isinstance(photo_image, dict):
            value = normalize_text(photo_image.get("uri"))
            if value:
                urls.append(value)
    seen = set()
    clean_urls = []
    for url in urls:
        if url not in seen:
            seen.add(url)
            clean_urls.append(url)
    return clean_urls[:10]


def normalize_post(row: Dict[str, Any], source_file: str) -> Optional[Dict[str, Any]]:
    text = str(row.get("text") or "").strip()
    if not normalize_text(text):
        return None

    post_id = stable_post_id(row, text)
    group_title = normalize_text(row.get("groupTitle"))
    title = first_line(text)
    city = infer_city(text, group_title)
    hashtags = extract_hashtags(text)
    image_urls = attachment_urls(row)

    likes = int(row.get("likesCount") or row.get("reactionLikeCount") or 0)
    comments = int(row.get("commentsCount") or 0)
    shares = int(row.get("sharesCount") or 0)
    score = likes + comments * 2 + shares * 3

    return {
        "_id": post_id,
        "title": title or f"Facebook post {post_id}",
        "summary": title or normalize_text(text)[:240],
        "content": text,
        "area": {
            "city": city,
            "district": "",
            "ward": "",
            "addressText": "",
        },
        "dishTags": [],
        "hashtags": hashtags,
        "imageUrls": image_urls,
        "priceMin": None,
        "priceMax": None,
        "engagement": {
            "likes": likes,
            "comments": comments,
            "shares": shares,
            "score": score,
        },
        "source": {
            "postUrl": normalize_text(row.get("url")),
            "facebookUrl": normalize_text(row.get("facebookUrl")),
            "legacyId": normalize_text(row.get("legacyId")),
            "rawId": normalize_text(row.get("id")),
            "feedbackId": normalize_text(row.get("feedbackId")),
            "groupTitle": group_title,
            "inputUrl": normalize_text(row.get("inputUrl")),
            "time": normalize_text(row.get("time")),
            "sourceFile": source_file,
        },
        "eval": {
            "domain": infer_domain(text, group_title),
            "text_chars": len(text),
        },
    }


def load_and_normalize_crawl(paths: List[str]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    posts: List[Dict[str, Any]] = []
    stats: List[Dict[str, Any]] = []
    seen_keys = set()
    seen_text_hashes = set()

    for path in paths:
        payload = load_json(path)
        rows = list(iter_rows(payload))
        added = 0
        skipped_empty = 0
        duplicates = 0
        for row in rows:
            key = dedupe_key(row)
            text_hash = short_hash(normalize_for_match(row.get("text")), 24)
            if key in seen_keys or text_hash in seen_text_hashes:
                duplicates += 1
                continue
            seen_keys.add(key)
            seen_text_hashes.add(text_hash)
            post = normalize_post(row, os.path.basename(path))
            if not post:
                skipped_empty += 1
                continue
            posts.append(post)
            added += 1
        stats.append(
            {
                "source_file": os.path.basename(path),
                "raw_rows": len(rows),
                "added_unique_posts": added,
                "duplicates": duplicates,
                "skipped_empty": skipped_empty,
            }
        )

    return posts, stats


def load_testcases(path: str) -> List[Dict[str, Any]]:
    payload = load_json(path)
    if isinstance(payload, list):
        return [row for row in payload if isinstance(row, dict)]
    if isinstance(payload, dict):
        rows = payload.get("testcases") or payload.get("cases") or payload.get("data") or []
        return [row for row in rows if isinstance(row, dict)]
    return []


def best_match_context(context: str, posts: List[Dict[str, Any]]) -> Tuple[str, Optional[Dict[str, Any]], float]:
    needle = normalize_for_match(context)
    if not needle:
        return "empty_context", None, 0.0

    prefix = needle[:120]
    short_prefix = needle[:80]
    best_post: Optional[Dict[str, Any]] = None
    best_score = 0.0

    for post in posts:
        text = normalize_for_match(post.get("content"))
        if needle in text:
            return "exact_context", post, 1.0
        if len(prefix) >= 30 and prefix in text:
            return "prefix_120", post, 0.92
        if len(short_prefix) >= 30 and short_prefix in text:
            return "prefix_80", post, 0.86

        needle_tokens = set(re.findall(r"\w+", needle))
        text_tokens = set(re.findall(r"\w+", text))
        if not needle_tokens or not text_tokens:
            continue
        overlap = len(needle_tokens & text_tokens)
        score = overlap / max(1, len(needle_tokens))
        if score > best_score:
            best_score = score
            best_post = post

    if best_score >= 0.75:
        return "token_overlap", best_post, round(best_score, 4)
    return "no_match", best_post if best_score > 0 else None, round(best_score, 4)


def testcase_input(case: Dict[str, Any]) -> str:
    return normalize_text(case.get("input") or case.get("question"))


def testcase_context(case: Dict[str, Any]) -> str:
    contexts = case.get("retrieval_context")
    if isinstance(contexts, list):
        return "\n".join([str(item) for item in contexts if str(item).strip()])
    if isinstance(contexts, str):
        return contexts
    question = testcase_input(case)
    marker = "Noi dung/boi canh bai viet nguon:"
    if marker in question:
        return question.split(marker, 1)[1].strip()
    return question


def compact_prompt_text(text: str, max_len: int = 120) -> str:
    text = re.sub(r"https?://\S+", "", normalize_text(text))
    text = re.sub(r"[#*_~`]+", "", text)
    text = re.sub(r"\s+", " ", text).strip(" -–—:;,.")
    return text[:max_len].strip(" -–—:;,.")


def extract_prices(text: str, limit: int = 4) -> List[str]:
    patterns = [
        r"\b\d{1,3}(?:[.,]\d{3})*\s*(?:k|K|đ|Đ|vnd|vnđ|VNĐ)\b",
        r"\b\d{1,3}\s*(?:-|–|~|đến)\s*\d{1,3}\s*(?:k|K)\b",
    ]
    prices: List[str] = []
    seen = set()
    for pattern in patterns:
        for match in re.findall(pattern, text or "", flags=re.IGNORECASE):
            value = normalize_text(match)
            key = value.casefold()
            if value and key not in seen:
                seen.add(key)
                prices.append(value)
            if len(prices) >= limit:
                return prices
    return prices


def extract_address_hint(text: str) -> str:
    for raw_line in str(text or "").splitlines():
        line = normalize_text(raw_line)
        lowered = line.casefold()
        if not line:
            continue
        if any(marker in lowered for marker in ["địa chỉ", "dia chi", "đ/c", "address", "địa điểm", "dia diem"]):
            return compact_prompt_text(
                re.sub(r"(?i)^.*?(địa chỉ|dia chi|đ/c|address|địa điểm|dia diem)\s*[:：-]?\s*", "", line),
                90,
            )
        address_markers = [
            " đường ", " duong ", " phường ", " phuong ", " quận ", " quan ",
            " ngõ ", " ngo ", " ngách ", " hẻm ", " hem ", " lô ", " cs1", " cs2", " p.", " q.",
        ]
        if any(marker in f" {lowered} " for marker in address_markers) and re.search(r"\d", line):
            return compact_prompt_text(line, 90)
    return ""


def contains_term(text: str, term: str) -> bool:
    escaped = re.escape(term.casefold())
    escaped = escaped.replace(r"\ ", r"\s+")
    return bool(re.search(rf"(?<![0-9a-zà-ỹ]){escaped}(?![0-9a-zà-ỹ])", text.casefold()))


def extract_topic_terms(text: str, limit: int = 3) -> List[str]:
    menu_terms = [
        "bánh đúc", "bánh mì", "bún đậu", "hải sản", "trà sữa", "cà phê",
        "du thuyền", "food tour", "khách sạn", "homestay", "villa",
        "gà", "vịt", "bò", "heo", "lòng", "ốc", "bún", "phở", "mì", "miến",
        "cơm", "xôi", "bánh", "lẩu", "nướng", "buffet", "cafe", "chè",
    ]
    hits: List[str] = []
    for term in menu_terms:
        if contains_term(text, term) and term not in hits:
            hits.append(term)
        if len(hits) >= limit:
            break
    return hits


def post_subject(post: Dict[str, Any]) -> str:
    title = compact_prompt_text(post.get("title") or post.get("summary") or "", 90)
    if title:
        return title
    terms = extract_topic_terms(post.get("content") or "", 1)
    return terms[0] if terms else "quán này"


def realistic_question_for_post(post: Dict[str, Any], variant: int = 0) -> Tuple[str, str]:
    content = post.get("content") or ""
    source = post.get("source") or {}
    domain = (post.get("eval") or {}).get("domain") or "food"
    city = ((post.get("area") or {}).get("city") or "").strip()
    group_title = source.get("groupTitle") or ""
    area = city or infer_city(content, group_title) or extract_address_hint(content)
    subject = post_subject(post)
    topics = extract_topic_terms(content)
    topic = topics[0] if topics else subject
    prices = extract_prices(content)
    has_ship = any(word in normalize_for_match(content) for word in ["ship", "giao hàng", "shopeefood", "grabfood", "xanh sm"])
    has_address = bool(extract_address_hint(content))

    if domain == "hotel":
        if area:
            question = f"Ở {area} có chỗ lưu trú nào ổn không, tiện ích và vị trí thế nào?"
        else:
            question = f"{subject} có tiện ích gì, ở có tiện không?"
        return question, "stay_recommendation"

    if domain == "travel_experience":
        if prices:
            question = f"Trải nghiệm {subject} có gì đáng chú ý, giá khoảng bao nhiêu?"
        elif area:
            question = f"Đi {area} có địa điểm/trải nghiệm nào đáng thử không?"
        else:
            question = f"{subject} có gì đáng thử không?"
        return question, "travel_recommendation"

    if domain == "other":
        if area:
            return f"Bài này có thông tin gì đáng chú ý ở {area}?", "general_context"
        return f"Bài này đang nói về thông tin gì?", "general_context"

    food_templates = []
    if area and topic:
        food_templates.append((f"Ở {area} có món {topic} nào ngon đáng thử không?", "food_discovery"))
    if subject and prices:
        food_templates.append((f"{subject} giá có ổn không, nên gọi món gì?", "price_quality"))
    if subject:
        food_templates.append((f"{subject} có ngon không, có đáng ghé thử không?", "quality_check"))
    if has_ship and topic:
        food_templates.append((f"Món {topic} này có đặt ship được không, giá tầm bao nhiêu?", "delivery_price"))
    if has_address and subject:
        food_templates.append((f"{subject} ở đâu, có gì nổi bật?", "location_detail"))
    if not food_templates:
        food_templates.append(("Có quán/món nào trong bài review này đáng thử không?", "food_summary"))

    return food_templates[variant % len(food_templates)]


def expected_outline_for_post(post: Dict[str, Any], intent: str) -> str:
    content = post.get("content") or ""
    subject = post_subject(post)
    topics = ", ".join(extract_topic_terms(content)) or "món/quán/dịch vụ được nhắc trong bài"
    prices = ", ".join(extract_prices(content)) or "không thấy giá cụ thể trong context"
    address = extract_address_hint(content) or "không thấy địa chỉ cụ thể trong context"
    city = ((post.get("area") or {}).get("city") or "").strip()
    city_part = f" Khu vực liên quan: {city}." if city else ""
    summary = normalize_text(content)[:520]
    return (
        f"Trả lời như đang tư vấn cho người dùng thật về {subject}. "
        f"Nêu đúng thông tin có trong bài: chủ đề/món/quán là {topics}; "
        f"giá/chi phí: {prices}; địa chỉ/khu vực: {address}.{city_part} "
        f"Nếu người dùng hỏi ngon/rẻ/đáng thử, chỉ nhận xét dựa trên nội dung review, "
        f"không tự bịa trải nghiệm ngoài context. Tóm tắt nguồn: {summary}"
    )


def make_realistic_case(
    case: Dict[str, Any],
    post: Dict[str, Any],
    idx: int,
    old_id: str,
    status: str,
    score: float,
) -> Dict[str, Any]:
    question, intent = realistic_question_for_post(post, idx)
    new_id = post.get("_id") or ""
    source = post.get("source") or {}
    new_case = dict(case)
    new_case["id"] = new_case.get("id") or new_case.get("test_id") or f"case_{idx}"
    new_case["test_id"] = new_case.get("test_id") or new_case["id"]
    new_case["type"] = "single_turn"
    new_case["input"] = question
    new_case["question"] = question
    new_case["question_type"] = intent
    new_case["original_input"] = testcase_input(case)
    new_case["original_expected_chunk_id"] = old_id
    new_case["expected_chunk_id"] = new_id
    new_case["expected_output"] = expected_outline_for_post(post, intent)
    new_case["retrieval_context"] = [post.get("content", "")]
    new_case["context"] = post.get("content", "")
    new_case["target_metadata"] = {
        "source_doc_id": new_id,
        "source_url": source.get("postUrl", ""),
        "legacyId": source.get("legacyId", ""),
        "groupTitle": source.get("groupTitle", ""),
        "match_status": status,
        "match_score": score,
        "rewritten_as_realistic_query": True,
    }
    return new_case


def audit_existing_testcases(cases: List[Dict[str, Any]], posts: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    audit_rows: List[Dict[str, Any]] = []
    converted: List[Dict[str, Any]] = []

    for idx, case in enumerate(cases, 1):
        context = testcase_context(case)
        status, post, score = best_match_context(context, posts)
        old_id = str(case.get("expected_chunk_id") or "")
        new_id = post.get("_id") if post else ""
        row = {
            "test_id": case.get("test_id") or case.get("id") or f"case_{idx}",
            "match_status": status,
            "match_score": score,
            "old_expected_chunk_id": old_id,
            "new_expected_chunk_id": new_id,
            "matched_url": ((post or {}).get("source") or {}).get("postUrl", ""),
            "matched_group": ((post or {}).get("source") or {}).get("groupTitle", ""),
            "context_preview": normalize_text(context)[:240],
        }
        audit_rows.append(row)

        if post and status != "no_match":
            converted.append(make_realistic_case(case, post, idx, old_id, status, score))

    return audit_rows, converted


def make_conversation_case(case: Dict[str, Any], index: int) -> Dict[str, Any]:
    context = normalize_text((case.get("retrieval_context") or [case.get("context") or ""])[0])
    question_type = str(case.get("question_type") or "")
    topic = (extract_topic_terms(context, 1) or [post_subject({"title": case.get("question") or ""})])[0]
    prices = extract_prices(context)
    if question_type.startswith("stay"):
        followup = "Chỗ đó có tiện đi food tour không, giá trong bài có nhắc không?"
    elif question_type.startswith("travel"):
        followup = "Đi trải nghiệm đó có đáng không, chi phí trong bài ghi thế nào?"
    else:
        ask_price = "rẻ không, giá tầm bao nhiêu?" if prices else "giá trong bài có nhắc không?"
        followup = f"Món {topic} ở đó có ngon không, {ask_price}"
    source_doc_id = ((case.get("target_metadata") or {}).get("source_doc_id") or case.get("expected_chunk_id") or "")
    return {
        "id": f"FB_CONV_{index:04d}",
        "test_id": f"FB_CONV_{index:04d}",
        "type": "conversational",
        "difficulty": "medium",
        "domain": case.get("domain") or case.get("category") or "food",
        "scenario": "Người dùng hỏi tự nhiên về món/quán rồi hỏi tiếp về chất lượng và giá.",
        "expected_chunk_id": source_doc_id,
        "context": context,
        "turns": [
            {
                "role": "user",
                "content": case.get("input") or case.get("question") or "",
                "expected_assistant_output_outline": case.get("expected_output") or "",
                "context": context,
            },
            {
                "role": "user",
                "content": followup,
                "expected_assistant_output_outline": (
                    "Giữ đúng ngữ cảnh bài trước. Trả lời dựa trên review gốc: nêu cảm nhận/điểm nổi bật "
                    "nếu bài có nói, nêu giá nếu có, và nói rõ nếu context không đủ để kết luận."
                ),
                "context": context,
            },
        ],
        "target_metadata": case.get("target_metadata") or {},
    }


def make_seed_question(post: Dict[str, Any], index: int) -> Dict[str, Any]:
    domain = (post.get("eval") or {}).get("domain") or "food"
    post_id = post["_id"]
    title = post.get("title") or f"Facebook post {index}"
    content = post.get("content") or ""
    source = post.get("source") or {}
    source_snippet = normalize_text(content)[:500]

    if domain == "hotel":
        question = (
            "Bài viết này đang giới thiệu chỗ lưu trú hoặc dịch vụ gì? "
            f"Tóm tắt các thông tin quan trọng.\nNội dung/bối cảnh bài viết nguồn: {source_snippet}"
        )
    elif domain == "travel_experience":
        question = (
            "Bài viết này nhắc đến trải nghiệm du lịch hoặc địa điểm nào? "
            f"Tóm tắt các điểm chính.\nNội dung/bối cảnh bài viết nguồn: {source_snippet}"
        )
    else:
        question = (
            "Bài viết này đang nhắc đến món ăn, quán hoặc địa điểm nào? "
            f"Tóm tắt các điểm chính.\nNội dung/bối cảnh bài viết nguồn: {source_snippet}"
        )

    return {
        "id": f"FB_ST_{index:04d}",
        "test_id": f"FB_ST_{index:04d}",
        "type": "single_turn",
        "difficulty": "medium",
        "question_type": "what",
        "domain": domain,
        "input": question,
        "question": question,
        "expected_output_outline": [
            "Nêu đúng chủ đề chính của bài viết dựa trên nội dung gốc.",
            "Tóm tắt các chi tiết quan trọng như món/dịch vụ/địa điểm, giá hoặc tiện ích nếu có.",
            "Không thêm thông tin không xuất hiện trong bài viết.",
        ],
        "expected_chunk_id": post_id,
        "retrieval_context": [content],
        "context": content,
        "target_metadata": {
            "source_doc_id": post_id,
            "source_url": source.get("postUrl", ""),
            "legacyId": source.get("legacyId", ""),
            "groupTitle": source.get("groupTitle", ""),
            "time": source.get("time", ""),
        },
    }


def create_seed_testcases(posts: List[Dict[str, Any]], limit: int) -> List[Dict[str, Any]]:
    candidates = [post for post in posts if is_seed_candidate(post)]
    candidates.sort(
        key=lambda post: (
            -seed_quality_score(post),
            post.get("_id", ""),
        )
    )
    selected = candidates[:limit]
    return [make_seed_question(post, idx + 1) for idx, post in enumerate(selected)]


def is_answerable_case(case: Dict[str, Any]) -> bool:
    contexts = case.get("retrieval_context") or []
    context = normalize_text(contexts[0] if contexts else case.get("context"))
    if len(context) < MIN_ANSWERABLE_CONTEXT_CHARS:
        return False
    lowered = context.casefold()
    if any(pattern.casefold() in lowered[:240] for pattern in UNANSWERABLE_PATTERNS + EXCLUDE_SEED_KEYWORDS):
        return False
    # Keep posts that contain enough descriptive signals for a grounded summary.
    signal_keywords = QUALITY_SEED_KEYWORDS + [
        "địa điểm",
        "dịch vụ",
        "tiện ích",
        "địa chỉ",
        "giờ",
        "mở cửa",
        "trải nghiệm",
        "khuyến mãi",
        "ưu đãi",
    ]
    signal_count = sum(1 for keyword in signal_keywords if contains_term(lowered, keyword) or keyword.casefold() in lowered)
    topic_count = sum(1 for keyword in FOOD_KEYWORDS + TRAVEL_KEYWORDS if contains_term(lowered, keyword) or keyword.casefold() in lowered)
    return signal_count >= 1 and topic_count >= 1


def summarize_audit(rows: List[Dict[str, Any]]) -> Dict[str, Any]:
    counts: Dict[str, int] = {}
    for row in rows:
        status = str(row.get("match_status") or "")
        counts[status] = counts.get(status, 0) + 1
    matched = sum(count for status, count in counts.items() if status not in {"no_match", "empty_context"})
    return {
        "total_cases": len(rows),
        "matched_cases": matched,
        "unmatched_cases": len(rows) - matched,
        "match_status_counts": counts,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Prepare Facebook crawl corpus and eval testcase audit")
    parser.add_argument("--crawl", nargs="+", default=DEFAULT_CRAWL_PATHS, help="Facebook scraper JSON files")
    parser.add_argument("--existing-testcases", default=DEFAULT_EXISTING_TESTCASES)
    parser.add_argument("--output-dir", default=DEFAULT_OUTPUT_DIR)
    parser.add_argument("--seed-limit", type=int, default=100)
    args = parser.parse_args()

    os.makedirs(args.output_dir, exist_ok=True)

    posts, source_stats = load_and_normalize_crawl(args.crawl)
    corpus = {
        "schema_version": "facebook_crawl_corpus_v1",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "source_files": args.crawl,
        "source_stats": source_stats,
        "total_unique_posts": len(posts),
        "reviews": posts,
    }

    existing_cases = load_testcases(args.existing_testcases)
    audit_rows, converted_cases = audit_existing_testcases(existing_cases, posts)
    seed_cases = create_seed_testcases(posts, args.seed_limit)

    audit_summary = {
        "schema_version": "facebook_crawl_audit_v1",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "corpus_unique_posts": len(posts),
        "source_stats": source_stats,
        "existing_testcases": args.existing_testcases,
        "audit": summarize_audit(audit_rows),
        "recommended_next_step": (
            "Use exact_context/prefix_120/prefix_80/token_overlap matches for manual review; "
            "do not run paid DeepEval on no_match cases."
        ),
    }

    converted_payload = {
        "schema_version": "vivutravel_testcases_from_facebook_crawl_v1",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "source_existing_testcases": args.existing_testcases,
        "testcases": converted_cases,
    }

    verified_cases = [
        case
        for case in converted_cases
        if ((case.get("target_metadata") or {}).get("match_status") in DEFAULT_VERIFIED_STATUSES)
    ]
    verified_payload = {
        "schema_version": "facebook_crawl_verified_testcases_v1",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "source_existing_testcases": args.existing_testcases,
        "verified_match_statuses": DEFAULT_VERIFIED_STATUSES,
        "review_note": "Use this file before paid DeepEval. It excludes token_overlap and no_match cases.",
        "testcases": verified_cases,
    }

    answerable_cases = [case for case in verified_cases if is_answerable_case(case)]
    answerable_payload = {
        "schema_version": "facebook_crawl_answerable_testcases_v1",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "source_verified_testcases": f"testcases_facebook_crawl_verified_{len(verified_cases)}.json",
        "filter": {
            "min_context_chars": MIN_ANSWERABLE_CONTEXT_CHARS,
            "excluded_patterns": UNANSWERABLE_PATTERNS + EXCLUDE_SEED_KEYWORDS,
            "note": "Filters out short or underspecified posts before paid DeepEval answer-quality scoring.",
        },
        "testcases": answerable_cases,
    }
    conversation_cases = [
        make_conversation_case(case, idx + 1)
        for idx, case in enumerate(answerable_cases[: min(60, len(answerable_cases))])
    ]
    conversation_payload = {
        "schema_version": "facebook_crawl_realistic_conversation_testcases_v1",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "source_answerable_testcases": f"testcases_facebook_crawl_answerable_{len(answerable_cases)}.json",
        "generation_note": (
            "Two-turn cases that mimic users asking a natural discovery question, then a follow-up "
            "about taste/price while keeping the same source review context."
        ),
        "testcases": conversation_cases,
    }

    seed_payload = {
        "schema_version": "facebook_crawl_seed_testcases_v1",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "generation_note": "Deterministic seed testcases. Review expected_output_outline before final paid DeepEval.",
        "testcases": seed_cases,
    }

    paths = {
        "corpus": os.path.join(args.output_dir, "facebook_crawl_corpus_reviews.json"),
        "audit_summary": os.path.join(args.output_dir, "facebook_crawl_testcase_audit_summary.json"),
        "audit_csv": os.path.join(args.output_dir, "facebook_crawl_testcase_audit.csv"),
        "converted_testcases": os.path.join(args.output_dir, "testcases_facebook_crawl_matched_from_existing.json"),
        "verified_testcases": os.path.join(args.output_dir, f"testcases_facebook_crawl_verified_{len(verified_cases)}.json"),
        "answerable_testcases": os.path.join(args.output_dir, f"testcases_facebook_crawl_answerable_{len(answerable_cases)}.json"),
        "conversation_testcases": os.path.join(args.output_dir, f"testcases_facebook_crawl_conversations_{len(conversation_cases)}.json"),
        "seed_testcases": os.path.join(args.output_dir, f"testcases_facebook_crawl_seed_{len(seed_cases)}.json"),
    }

    write_json(paths["corpus"], corpus)
    write_json(paths["audit_summary"], audit_summary)
    write_csv(paths["audit_csv"], audit_rows)
    write_json(paths["converted_testcases"], converted_payload)
    write_json(paths["verified_testcases"], verified_payload)
    write_json(paths["answerable_testcases"], answerable_payload)
    write_json(paths["conversation_testcases"], conversation_payload)
    write_json(paths["seed_testcases"], seed_payload)

    print("=== Facebook crawl eval preparation complete ===")
    print(f"Unique posts        : {len(posts)}")
    print(f"Existing testcases  : {len(existing_cases)}")
    print(f"Matched testcases   : {audit_summary['audit']['matched_cases']}")
    print(f"Unmatched testcases : {audit_summary['audit']['unmatched_cases']}")
    print(f"Verified testcases  : {len(verified_cases)}")
    print(f"Answerable testcases: {len(answerable_cases)}")
    print(f"Conversation cases  : {len(conversation_cases)}")
    print(f"Seed testcases      : {len(seed_cases)}")
    for name, path in paths.items():
        print(f"{name:20}: {path}")


if __name__ == "__main__":
    main()
