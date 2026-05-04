import json
import os
import re
import time
import unicodedata
from dataclasses import dataclass
from typing import Any, Dict, Iterable, List, Optional

import chromadb
import requests
from sentence_transformers import SentenceTransformer

DEFAULT_COLLECTION_NAME = "food_reviews"
DEFAULT_INDEX_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".rag"))
DEFAULT_MODEL_NAME = os.getenv(
    "RAG_EMBED_MODEL",
    "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
)
DEFAULT_MAX_DOCS = int(os.getenv("RAG_MAX_DOCS", "3000"))
DEFAULT_TOP_K = int(os.getenv("RAG_TOP_K", "5"))
DEFAULT_QUERY_K_MULTIPLIER = int(os.getenv("RAG_QUERY_K_MULTIPLIER", "4"))
DEFAULT_MIN_SCORE = float(os.getenv("RAG_MIN_SCORE", "0.28"))
DEFAULT_REBUILD_HOURS = int(os.getenv("RAG_REBUILD_HOURS", "24"))
DEFAULT_BACKEND_TIMEOUT = int(os.getenv("RAG_BACKEND_TIMEOUT", "10"))
DEFAULT_CHUNK_SIZE = int(os.getenv("RAG_CHUNK_SIZE", "800"))
DEFAULT_CHUNK_OVERLAP = int(os.getenv("RAG_CHUNK_OVERLAP", "120"))
DEFAULT_MIN_CHUNK_CHARS = int(os.getenv("RAG_MIN_CHUNK_CHARS", "120"))

META_FILE_NAME = "food_reviews.meta.json"

CITY_ALIASES = {
    "ha noi": "Hà Nội",
    "hanoi": "Hà Nội",
    "ho chi minh": "Hồ Chí Minh",
    "tphcm": "Hồ Chí Minh",
    "tp hcm": "Hồ Chí Minh",
    "sai gon": "Hồ Chí Minh",
    "da nang": "Đà Nẵng",
    "danang": "Đà Nẵng",
    "nha trang": "Khánh Hòa",
    "phu quoc": "Kiên Giang",
    "da lat": "Lâm Đồng",
    "dalat": "Lâm Đồng",
    "hue": "Thừa Thiên Huế",
    "sapa": "Lào Cai",
}

DISH_KEYWORDS = [
    "pho",
    "bun",
    "bun cha",
    "bun rieu",
    "bun dau",
    "com tam",
    "banh mi",
    "banh cuon",
    "banh xeo",
    "lau",
    "nuong",
    "oc",
    "che",
    "tra sua",
    "ca phe",
]


@dataclass
class FoodReviewRagItem:
    review_id: str
    chunk_id: str
    chunk_index: int
    chunk_type: str
    title: str
    summary: str
    city: str
    district: str
    image_url: str
    price_min: Optional[float]
    price_max: Optional[float]
    post_url: str
    engagement_score: float
    similarity: float
    final_score: float


class FoodReviewRagService:
    def __init__(
        self,
        backend_url: str,
        index_dir: Optional[str] = None,
        collection_name: str = DEFAULT_COLLECTION_NAME,
        model_name: str = DEFAULT_MODEL_NAME,
        max_docs: int = DEFAULT_MAX_DOCS,
        top_k: int = DEFAULT_TOP_K,
        query_k_multiplier: int = DEFAULT_QUERY_K_MULTIPLIER,
        min_score: float = DEFAULT_MIN_SCORE,
        chunk_size: int = DEFAULT_CHUNK_SIZE,
        chunk_overlap: int = DEFAULT_CHUNK_OVERLAP,
        min_chunk_chars: int = DEFAULT_MIN_CHUNK_CHARS,
    ) -> None:
        self.backend_url = backend_url.rstrip("/")
        self.index_dir = index_dir or DEFAULT_INDEX_DIR
        self.collection_name = collection_name
        self.model_name = model_name
        self.max_docs = max_docs
        self.top_k = top_k
        self.query_k_multiplier = max(1, query_k_multiplier)
        self.min_score = min_score
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.min_chunk_chars = min_chunk_chars

        self._client: Optional[chromadb.PersistentClient] = None
        self._collection = None
        self._model: Optional[SentenceTransformer] = None
        self._last_build_check = 0.0

    def query(self, question: str) -> List[FoodReviewRagItem]:
        if not question or not question.strip():
            return []

        self._ensure_index()
        if not self._collection or self._collection.count() == 0:
            return []

        model = self._get_model()
        query_embedding = model.encode([question], normalize_embeddings=True)[0].tolist()
        query_k = max(self.top_k * self.query_k_multiplier, self.top_k)

        raw = self._collection.query(
            query_embeddings=[query_embedding],
            n_results=query_k,
            include=["documents", "metadatas", "distances"],
        )

        docs = raw.get("documents", [[]])[0] or []
        metadatas = raw.get("metadatas", [[]])[0] or []
        distances = raw.get("distances", [[]])[0] or []

        items = self._build_items(docs, metadatas, distances)
        if not items:
            return []

        location_hint = extract_location_hint(question)
        dish_hints = extract_dish_hints(question)

        scored = rerank_items(items, location_hint, dish_hints)
        collapsed = collapse_results(scored)
        filtered = [item for item in collapsed if item.final_score >= self.min_score]
        filtered.sort(key=lambda item: item.final_score, reverse=True)
        return filtered[: self.top_k]

    def _ensure_index(self) -> None:
        now = time.time()
        if now - self._last_build_check < 60:
            return
        self._last_build_check = now

        os.makedirs(self.index_dir, exist_ok=True)
        self._ensure_client()
        self._ensure_collection()

        if self._collection.count() == 0:
            self._build_index()
            return

        if self._should_rebuild():
            self._build_index()

    def _ensure_client(self) -> None:
        if self._client is None:
            self._client = chromadb.PersistentClient(path=self.index_dir)

    def _ensure_collection(self) -> None:
        if self._client is None:
            self._ensure_client()
        if self._client is None:
            return
        if self._collection is None:
            self._collection = self._client.get_or_create_collection(
                name=self.collection_name,
                metadata={"hnsw:space": "cosine"},
            )

    def _get_model(self) -> SentenceTransformer:
        if self._model is None:
            self._model = SentenceTransformer(self.model_name)
        return self._model

    def _should_rebuild(self) -> bool:
        meta_path = os.path.join(self.index_dir, META_FILE_NAME)
        if not os.path.exists(meta_path):
            return False

        try:
            with open(meta_path, "r", encoding="utf-8") as f:
                meta = json.load(f)
            built_at = float(meta.get("built_at", 0))
            meta_model = str(meta.get("model_name", ""))
            meta_chunk_size = int(meta.get("chunk_size", 0) or 0)
            meta_chunk_overlap = int(meta.get("chunk_overlap", 0) or 0)
            meta_min_chunk_chars = int(meta.get("min_chunk_chars", 0) or 0)
        except Exception:
            return False

        if meta_model and meta_model != self.model_name:
            return True

        if meta_chunk_size and meta_chunk_size != self.chunk_size:
            return True

        if meta_chunk_overlap and meta_chunk_overlap != self.chunk_overlap:
            return True

        if meta_min_chunk_chars and meta_min_chunk_chars != self.min_chunk_chars:
            return True

        age_hours = (time.time() - built_at) / 3600.0
        return age_hours >= DEFAULT_REBUILD_HOURS

    def _build_index(self) -> None:
        if self._client is None:
            self._ensure_client()
        if self._client is None:
            return

        try:
            self._client.delete_collection(self.collection_name)
        except Exception:
            pass

        self._collection = self._client.get_or_create_collection(
            name=self.collection_name,
            metadata={"hnsw:space": "cosine"},
        )

        reviews = self._fetch_all_reviews()
        if not reviews:
            return

        model = self._get_model()

        batch_texts: List[str] = []
        batch_ids: List[str] = []
        batch_meta: List[Dict[str, Any]] = []

        for item in reviews:
            docs = build_documents(
                item,
                chunk_size=self.chunk_size,
                chunk_overlap=self.chunk_overlap,
                min_chunk_chars=self.min_chunk_chars,
            )
            if not docs:
                continue
            for doc in docs:
                batch_ids.append(doc["id"])
                batch_texts.append(doc["text"])
                batch_meta.append(doc["metadata"])

            if len(batch_ids) >= 64:
                self._flush_batch(model, batch_ids, batch_texts, batch_meta)
                batch_ids, batch_texts, batch_meta = [], [], []

        if batch_ids:
            self._flush_batch(model, batch_ids, batch_texts, batch_meta)

        self._write_meta(count=self._collection.count())

    def _flush_batch(
        self,
        model: SentenceTransformer,
        batch_ids: List[str],
        batch_texts: List[str],
        batch_meta: List[Dict[str, Any]],
    ) -> None:
        embeddings = model.encode(batch_texts, normalize_embeddings=True).tolist()
        self._collection.add(
            ids=batch_ids,
            documents=batch_texts,
            metadatas=batch_meta,
            embeddings=embeddings,
        )

    def _write_meta(self, count: int) -> None:
        meta_path = os.path.join(self.index_dir, META_FILE_NAME)
        payload = {
            "built_at": time.time(),
            "count": count,
            "model_name": self.model_name,
            "chunk_size": self.chunk_size,
            "chunk_overlap": self.chunk_overlap,
            "min_chunk_chars": self.min_chunk_chars,
        }
        try:
            with open(meta_path, "w", encoding="utf-8") as f:
                json.dump(payload, f)
        except Exception:
            pass

    def _fetch_all_reviews(self) -> List[Dict[str, Any]]:
        reviews: List[Dict[str, Any]] = []
        page = 1
        limit = 50

        while len(reviews) < self.max_docs:
            try:
                response = requests.get(
                    f"{self.backend_url}/api/client/food-reviews",
                    params={"page": page, "limit": limit, "sortBy": "hot"},
                    timeout=DEFAULT_BACKEND_TIMEOUT,
                )
                response.raise_for_status()
                payload = response.json()
            except Exception:
                break

            items = payload.get("data", []) if isinstance(payload, dict) else []
            if not items:
                break

            reviews.extend(items)

            pagination = payload.get("pagination", {}) if isinstance(payload, dict) else {}
            total_pages = int(pagination.get("totalPages", 0) or 0)
            if total_pages and page >= total_pages:
                break

            page += 1

        return reviews[: self.max_docs]


def build_documents(
    item: Dict[str, Any],
    chunk_size: int,
    chunk_overlap: int,
    min_chunk_chars: int,
) -> List[Dict[str, Any]]:
    review_id = str(item.get("_id") or "").strip()
    title = safe_text(item.get("title"))
    summary = safe_text(item.get("summary"))
    content = safe_text(item.get("content"))

    if not review_id or not title:
        return []

    area = item.get("area") or {}
    city = safe_text(area.get("city"))
    district = safe_text(area.get("district"))
    ward = safe_text(area.get("ward"))
    address_text = safe_text(area.get("addressText"))

    dish_tags = [safe_text(tag) for tag in item.get("dishTags", []) if safe_text(tag)]
    hashtags = [safe_text(tag) for tag in item.get("hashtags", []) if safe_text(tag)]

    image_urls = [safe_text(url) for url in item.get("imageUrls", []) if safe_text(url)]
    image_url = image_urls[0] if image_urls else ""

    price_min = to_float(item.get("priceMin"))
    price_max = to_float(item.get("priceMax"))

    engagement = item.get("engagement") or {}
    score = to_float(engagement.get("score"))

    source = item.get("source") or {}
    post_url = safe_text(source.get("postUrl"))

    location_bits = ", ".join([bit for bit in [address_text, ward, district, city] if bit])
    price_text = build_price_text(price_min, price_max)
    location_text = f"Khu vuc: {location_bits}" if location_bits else ""
    dish_text = f"Mon: {', '.join(dish_tags)}" if dish_tags else ""
    hashtag_text = f"Hashtag: {', '.join(hashtags)}" if hashtags else ""
    price_line = f"Gia: {price_text}" if price_text else ""

    metadata_base = {
        "review_id": review_id,
        "title": title,
        "summary": summary[:240],
        "city": city,
        "district": district,
        "imageUrl": image_url,
        "priceMin": price_min or 0,
        "priceMax": price_max or 0,
        "score": score or 0,
        "postUrl": post_url,
        "dishTags": ",".join(dish_tags)[:200],
    }

    docs: List[Dict[str, Any]] = []

    content_chunks = split_text_into_chunks(
        content,
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        min_chunk_chars=min_chunk_chars,
    )

    total_chunks = len(content_chunks)

    title_summary_text = "\n".join(
        [part for part in [title, summary, location_text, dish_text, hashtag_text, price_line] if part]
    )
    docs.append(
        {
            "id": f"{review_id}#ts",
            "text": title_summary_text,
            "metadata": {
                **metadata_base,
                "chunk_id": "ts",
                "chunk_index": 0,
                "total_chunks": total_chunks,
                "chunk_type": "title_summary",
            },
        }
    )
    for idx, chunk_text in enumerate(content_chunks, 1):
        chunk_doc = "\n".join(
            [part for part in [title, chunk_text, location_text, dish_text, hashtag_text, price_line] if part]
        )
        docs.append(
            {
                "id": f"{review_id}#c{idx:02d}",
                "text": chunk_doc,
                "metadata": {
                    **metadata_base,
                    "chunk_id": f"c{idx:02d}",
                    "chunk_index": idx,
                    "total_chunks": total_chunks,
                    "chunk_type": "content",
                },
            }
        )

    return docs


def build_price_text(price_min: Optional[float], price_max: Optional[float]) -> str:
    if price_min and price_max and price_min != price_max:
        return f"{int(price_min)} - {int(price_max)}"
    value = price_min or price_max
    return str(int(value)) if value else ""


def split_text_into_chunks(
    text: str,
    chunk_size: int,
    chunk_overlap: int,
    min_chunk_chars: int,
) -> List[str]:
    if not text:
        return []

    parts: List[str] = []
    for raw in text.replace("\r", "\n").split("\n"):
        raw = raw.strip()
        if not raw:
            continue
        segments = re.split(r"(?<=[.!?！？。])\s+", raw)
        parts.extend([segment.strip() for segment in segments if segment.strip()])

    chunks: List[str] = []
    current = ""
    for part in parts:
        candidate = f"{current} {part}".strip()
        if len(candidate) <= chunk_size:
            current = candidate
            continue

        if current:
            chunks.append(current)

        if chunk_overlap and current:
            tail = current[-chunk_overlap:]
            current = f"{tail} {part}".strip()
        else:
            current = part

        while len(current) > chunk_size:
            chunks.append(current[:chunk_size])
            current = current[max(0, chunk_size - chunk_overlap) :].strip()

    if current:
        chunks.append(current)

    if min_chunk_chars > 0:
        chunks = [chunk for chunk in chunks if len(chunk) >= min_chunk_chars]

    return chunks


def safe_text(value: Any) -> str:
    if isinstance(value, str):
        return value.strip()
    return ""


def to_float(value: Any) -> Optional[float]:
    try:
        if value is None:
            return None
        return float(value)
    except Exception:
        return None


def normalize_text(text: str) -> str:
    normalized = unicodedata.normalize("NFD", text.lower())
    stripped = "".join(ch for ch in normalized if unicodedata.category(ch) != "Mn")
    stripped = re.sub(r"[^a-z0-9\s]", " ", stripped)
    return re.sub(r"\s+", " ", stripped).strip()


def extract_location_hint(text: str) -> Optional[str]:
    normalized = normalize_text(text)
    for alias, canonical in CITY_ALIASES.items():
        if alias in normalized:
            return canonical
    return None


def extract_dish_hints(text: str) -> List[str]:
    normalized = normalize_text(text)
    hints = []
    for keyword in DISH_KEYWORDS:
        key_norm = normalize_text(keyword)
        if key_norm and key_norm in normalized:
            hints.append(keyword)
    return hints


def _distance_to_similarity(distance: float) -> float:
    if distance is None:
        return 0.0
    return max(0.0, 1.0 - float(distance))


def _normalize_scores(scores: Iterable[float]) -> Dict[int, float]:
    scores_list = list(scores)
    max_score = max(scores_list) if scores_list else 0.0
    if max_score <= 0:
        return {i: 0.0 for i in range(len(scores_list))}
    return {i: min(1.0, score / max_score) for i, score in enumerate(scores_list)}


def rerank_items(
    items: List[FoodReviewRagItem],
    location_hint: Optional[str],
    dish_hints: List[str],
) -> List[FoodReviewRagItem]:
    engagement_scores = [item.engagement_score for item in items]
    normalized_engagement = _normalize_scores(engagement_scores)

    for idx, item in enumerate(items):
        engagement_boost = normalized_engagement.get(idx, 0.0)
        score = 0.7 * item.similarity + 0.3 * engagement_boost

        if location_hint and item.city and location_hint.lower() in item.city.lower():
            score += 0.05

        if dish_hints:
            for hint in dish_hints[:2]:
                if hint.lower() in item.summary.lower() or hint.lower() in item.title.lower():
                    score += 0.03

        item.final_score = min(1.0, score)

    return items


def collapse_results(items: List[FoodReviewRagItem]) -> List[FoodReviewRagItem]:
    grouped: Dict[str, FoodReviewRagItem] = {}
    for item in items:
        key = item.review_id or item.post_url
        if not key:
            continue
        existing = grouped.get(key)
        if not existing or item.final_score > existing.final_score:
            grouped[key] = item
    return list(grouped.values())


def build_summary_from_doc(doc_text: str) -> str:
    if not doc_text:
        return ""
    lines = [line.strip() for line in doc_text.split("\n") if line.strip()]
    if not lines:
        return ""
    return lines[0][:200]


def _build_items(
    docs: List[str],
    metadatas: List[Dict[str, Any]],
    distances: List[float],
) -> List[FoodReviewRagItem]:
    items: List[FoodReviewRagItem] = []

    for idx, metadata in enumerate(metadatas):
        doc_text = docs[idx] if idx < len(docs) else ""
        distance = distances[idx] if idx < len(distances) else None
        similarity = _distance_to_similarity(distance)

        review_id = safe_text(metadata.get("review_id"))
        chunk_id = safe_text(metadata.get("chunk_id"))
        chunk_type = safe_text(metadata.get("chunk_type"))
        try:
            chunk_index = int(metadata.get("chunk_index") or 0)
        except Exception:
            chunk_index = 0

        title = safe_text(metadata.get("title"))
        summary = safe_text(metadata.get("summary")) or build_summary_from_doc(doc_text)
        city = safe_text(metadata.get("city"))
        district = safe_text(metadata.get("district"))
        image_url = safe_text(metadata.get("imageUrl"))
        post_url = safe_text(metadata.get("postUrl"))
        price_min = to_float(metadata.get("priceMin"))
        price_max = to_float(metadata.get("priceMax"))
        engagement_score = to_float(metadata.get("score")) or 0.0

        if not title or not post_url:
            continue

        items.append(
            FoodReviewRagItem(
                review_id=review_id,
                chunk_id=chunk_id,
                chunk_index=chunk_index,
                chunk_type=chunk_type,
                title=title,
                summary=summary,
                city=city,
                district=district,
                image_url=image_url,
                price_min=price_min,
                price_max=price_max,
                post_url=post_url,
                engagement_score=engagement_score,
                similarity=similarity,
                final_score=similarity,
            )
        )

    return items
