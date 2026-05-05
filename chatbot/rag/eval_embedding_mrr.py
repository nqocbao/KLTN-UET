import argparse
import json
import math
import os
import sys
from statistics import mean
from typing import Any, Dict, Iterable, List, Optional, Tuple

import numpy as np
from sentence_transformers import SentenceTransformer

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from rag.food_reviews_rag import build_documents, normalize_text

DEFAULT_DATA_PATH = os.path.abspath(
    os.path.join(PROJECT_ROOT, ".vscode", "json", "foodtour_HaNoi_Data.json")
)
DEFAULT_QUERY_PATH = os.path.join(CURRENT_DIR, "eval_queries.json")
DEFAULT_BACKEND_URL = os.getenv("RAG_EVAL_API_URL", "http://localhost:5000")

DEFAULT_MODELS = [
    "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
    "sentence-transformers/paraphrase-multilingual-mpnet-base-v2",
    "sentence-transformers/distiluse-base-multilingual-cased-v2",
]


def load_queries(path: str) -> List[Dict[str, Any]]:
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return [q for q in data if isinstance(q, dict) and q.get("query")]


def fetch_reviews_from_api(base_url: str, limit: int = 50, max_pages: int = 200) -> List[Dict[str, Any]]:
    import requests

    reviews: List[Dict[str, Any]] = []
    page = 1

    while page <= max_pages:
        response = requests.get(
            f"{base_url.rstrip('/')}/api/client/food-reviews",
            params={"page": page, "limit": limit, "sortBy": "hot"},
            timeout=10,
        )
        response.raise_for_status()
        payload = response.json()

        items = payload.get("data", []) if isinstance(payload, dict) else []
        if not items:
            break

        reviews.extend(items)

        pagination = payload.get("pagination", {}) if isinstance(payload, dict) else {}
        total_pages = int(pagination.get("totalPages", 0) or 0)
        if total_pages and page >= total_pages:
            break
        page += 1

    return reviews


def build_review_from_raw(raw: Dict[str, Any], index: int) -> Dict[str, Any]:
    text = str(raw.get("text") or "").strip()
    title = text.split("\n")[0].strip() if text else f"review_{index}"
    summary = text.replace("\n", " ")[:220].strip()
    return {
        "_id": raw.get("legacyId") or raw.get("url") or str(index),
        "title": title,
        "summary": summary,
        "content": text,
        "area": {"city": "", "district": "", "ward": "", "addressText": ""},
        "dishTags": [],
        "hashtags": [],
        "imageUrls": [],
        "priceMin": None,
        "priceMax": None,
        "engagement": {"score": 0},
        "source": {"postUrl": raw.get("url") or ""},
    }


def load_reviews_from_file(path: str) -> List[Dict[str, Any]]:
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    reviews = []
    for idx, raw in enumerate(data):
        if isinstance(raw, dict):
            reviews.append(build_review_from_raw(raw, idx))
    return reviews


def build_docs(
    reviews: List[Dict[str, Any]],
    chunking_method: str,
    chunk_size: int,
    chunk_overlap: int,
    min_chunk_chars: int,
) -> Tuple[List[str], List[Dict[str, Any]], Dict[str, str]]:
    texts: List[str] = []
    metas: List[Dict[str, Any]] = []
    review_texts: Dict[str, str] = {}

    for review in reviews:
        review_id = str(review.get("_id") or "").strip()
        title = str(review.get("title") or "").strip()
        summary = str(review.get("summary") or "").strip()
        content = str(review.get("content") or "").strip()
        full_text = "\n".join([part for part in [title, summary, content] if part])
        if review_id and full_text:
            review_texts[review_id] = full_text

        docs = build_documents(
            review,
            chunking_method=chunking_method,
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            min_chunk_chars=min_chunk_chars,
        )
        for doc in docs:
            texts.append(doc["text"])
            metas.append(doc["metadata"])

    return texts, metas, review_texts


def normalize_terms(terms: Iterable[str]) -> List[str]:
    return [normalize_text(term) for term in terms if isinstance(term, str) and term.strip()]


def find_relevant_reviews(
    review_texts: Dict[str, str],
    required_terms: List[str],
) -> List[str]:
    if not required_terms:
        return []

    normalized_terms = normalize_terms(required_terms)
    relevant = []
    for review_id, text in review_texts.items():
        normalized_text = normalize_text(text)
        if all(term in normalized_text for term in normalized_terms):
            relevant.append(review_id)
    return relevant


def mrr_at_k(ranked_ids: List[str], relevant_ids: List[str], k: int = 5) -> float:
    relevant_set = set(relevant_ids)
    for idx, review_id in enumerate(ranked_ids[:k], 1):
        if review_id in relevant_set:
            return 1.0 / idx
    return 0.0


def collapse_by_review_id(
    scores: np.ndarray,
    metas: List[Dict[str, Any]],
    top_k: int,
) -> List[str]:
    ranked = scores.argsort()[::-1]
    selected: List[str] = []
    seen = set()
    for idx in ranked:
        review_id = str(metas[idx].get("review_id") or "")
        if not review_id or review_id in seen:
            continue
        seen.add(review_id)
        selected.append(review_id)
        if len(selected) >= top_k:
            break
    return selected


def evaluate_model(
    model_name: str,
    doc_texts: List[str],
    doc_metas: List[Dict[str, Any]],
    queries: List[Dict[str, Any]],
    review_texts: Dict[str, str],
    top_k: int,
) -> Dict[str, Any]:
    model = SentenceTransformer(model_name)
    doc_emb = model.encode(doc_texts, normalize_embeddings=True, batch_size=32)

    query_scores: List[float] = []
    skipped = 0

    for query in queries:
        text = query.get("query", "")
        required_terms = query.get("required_terms", [])
        relevant_ids = find_relevant_reviews(review_texts, required_terms)
        if not relevant_ids:
            skipped += 1
            continue

        q_emb = model.encode([text], normalize_embeddings=True)[0]
        scores = np.dot(doc_emb, q_emb)
        ranked_ids = collapse_by_review_id(scores, doc_metas, top_k=top_k)
        query_scores.append(mrr_at_k(ranked_ids, relevant_ids, k=top_k))

    return {
        "model": model_name,
        "dimension": model.get_sentence_embedding_dimension(),
        "mrr_at_5": round(mean(query_scores), 4) if query_scores else 0.0,
        "queries": len(query_scores),
        "skipped": skipped,
    }


def to_markdown_table(results: List[Dict[str, Any]]) -> str:
    header = "| Model | Dim | MRR@5 | Queries | Skipped |\n| --- | --- | --- | --- | --- |"
    rows = [
        f"| {r['model']} | {r['dimension']} | {r['mrr_at_5']} | {r['queries']} | {r['skipped']} |"
        for r in results
    ]
    return "\n".join([header] + rows)


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate embedding models with MRR@5")
    parser.add_argument("--data", default=DEFAULT_DATA_PATH, help="Path to raw json data file")
    parser.add_argument("--queries", default=DEFAULT_QUERY_PATH, help="Path to eval queries JSON")
    parser.add_argument("--api", default=DEFAULT_BACKEND_URL, help="Backend base URL")
    parser.add_argument("--source", choices=["auto", "api", "file"], default="auto")
    parser.add_argument("--models", nargs="+", default=DEFAULT_MODELS)
    parser.add_argument("--chunk-size", type=int, default=800)
    parser.add_argument("--chunk-overlap", type=int, default=120)
    parser.add_argument("--min-chunk-chars", type=int, default=120)
    parser.add_argument("--chunking-method", default="sentence")
    parser.add_argument("--top-k", type=int, default=5)
    parser.add_argument("--output", default="")
    args = parser.parse_args()

    queries = load_queries(args.queries)

    reviews: List[Dict[str, Any]] = []
    if args.source in {"api", "auto"}:
        try:
            reviews = fetch_reviews_from_api(args.api)
        except Exception:
            reviews = []

    if not reviews:
        if not os.path.exists(args.data):
            raise SystemExit("No reviews found. Provide --data or start backend API.")
        reviews = load_reviews_from_file(args.data)

    doc_texts, doc_metas, review_texts = build_docs(
        reviews,
        chunking_method=args.chunking_method,
        chunk_size=args.chunk_size,
        chunk_overlap=args.chunk_overlap,
        min_chunk_chars=args.min_chunk_chars,
    )

    results = []
    for model in args.models:
        result = evaluate_model(
            model,
            doc_texts,
            doc_metas,
            queries,
            review_texts,
            top_k=args.top_k,
        )
        results.append(result)
        print(result)

    table = to_markdown_table(results)
    print("\n" + table)

    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            f.write("# Embedding MRR@5 Results\n\n")
            f.write(table)
            f.write("\n")


if __name__ == "__main__":
    main()
