"""Build a Chroma RAG index from prepared Facebook crawl corpus."""

import argparse
import json
import os
import sys
import time
from typing import Any, Dict, List

from dotenv import load_dotenv

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from rag.food_reviews_rag import (  # noqa: E402
    DEFAULT_COLLECTION_NAME,
    META_FILE_NAME,
    FoodReviewRagService,
    build_documents,
)

DEFAULT_CORPUS = os.path.join(
    CURRENT_DIR,
    "outputs",
    "facebook_crawl_eval",
    "facebook_crawl_corpus_reviews.json",
)
DEFAULT_INDEX_DIR = os.path.join(PROJECT_ROOT, ".rag_eval", "facebook_crawl_fixed_600")
DEFAULT_CONFIG_PATH = os.path.join(
    CURRENT_DIR,
    "outputs",
    "facebook_crawl_eval",
    "rag_configs_facebook_crawl_fixed_600.json",
)
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


def load_reviews(path: str) -> List[Dict[str, Any]]:
    with open(path, "r", encoding="utf-8") as f:
        payload = json.load(f)
    if isinstance(payload, dict):
        reviews = payload.get("reviews") or payload.get("data") or []
    else:
        reviews = payload
    return [row for row in reviews if isinstance(row, dict)]


def write_json(path: str, payload: Any) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)


def main() -> None:
    load_environment()

    parser = argparse.ArgumentParser(description="Build Chroma index from prepared Facebook crawl corpus")
    parser.add_argument("--corpus", default=DEFAULT_CORPUS)
    parser.add_argument("--index-dir", default=DEFAULT_INDEX_DIR)
    parser.add_argument("--collection-name", default=DEFAULT_COLLECTION_NAME)
    parser.add_argument("--model", default="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
    parser.add_argument("--chunking-method", default="fixed", choices=["fixed", "paragraph", "sentence"])
    parser.add_argument("--chunk-size", type=int, default=600)
    parser.add_argument("--chunk-overlap", type=int, default=80)
    parser.add_argument("--min-chunk-chars", type=int, default=120)
    parser.add_argument("--similarity-threshold", type=float, default=0.0)
    parser.add_argument("--batch-size", type=int, default=64)
    parser.add_argument("--config-output", default=DEFAULT_CONFIG_PATH)
    args = parser.parse_args()

    reviews = load_reviews(args.corpus)
    if not reviews:
        raise SystemExit(f"No reviews found in {args.corpus}")

    os.makedirs(args.index_dir, exist_ok=True)
    service = FoodReviewRagService(
        backend_url="http://127.0.0.1:0",
        index_dir=args.index_dir,
        collection_name=args.collection_name,
        model_name=args.model,
        chunking_method=args.chunking_method,
        chunk_size=args.chunk_size,
        chunk_overlap=args.chunk_overlap,
        min_chunk_chars=args.min_chunk_chars,
        top_k=5,
        min_score=args.similarity_threshold,
        query_k_multiplier=4,
    )
    service._ensure_client()
    if service._client is None:
        raise SystemExit("Could not initialize Chroma client")

    try:
        service._client.delete_collection(args.collection_name)
    except Exception:
        pass
    service._collection = service._client.get_or_create_collection(
        name=args.collection_name,
        metadata={"hnsw:space": "cosine"},
    )

    model = service._get_model()
    batch_ids: List[str] = []
    batch_texts: List[str] = []
    batch_meta: List[Dict[str, Any]] = []
    docs_total = 0

    for idx, review in enumerate(reviews, 1):
        docs = build_documents(
            review,
            chunking_method=args.chunking_method,
            chunk_size=args.chunk_size,
            chunk_overlap=args.chunk_overlap,
            min_chunk_chars=args.min_chunk_chars,
        )
        for doc in docs:
            batch_ids.append(doc["id"])
            batch_texts.append(doc["text"])
            batch_meta.append(doc["metadata"])
            docs_total += 1
            if len(batch_ids) >= args.batch_size:
                service._flush_batch(model, batch_ids, batch_texts, batch_meta)
                batch_ids.clear()
                batch_texts.clear()
                batch_meta.clear()
        if idx % 250 == 0:
            print(f"  indexed reviews={idx}/{len(reviews)} docs={docs_total}")

    if batch_ids:
        service._flush_batch(model, batch_ids, batch_texts, batch_meta)

    count = service._collection.count() if service._collection else 0
    meta = {
        "built_at": time.time(),
        "count": count,
        "source_corpus": os.path.abspath(args.corpus),
        "model_name": args.model,
        "chunking_method": args.chunking_method,
        "chunk_size": args.chunk_size,
        "chunk_overlap": args.chunk_overlap,
        "min_chunk_chars": args.min_chunk_chars,
    }
    write_json(os.path.join(args.index_dir, META_FILE_NAME), meta)

    config = [
        {
            "config_id": "facebook_crawl_fixed_600",
            "chunking_method": args.chunking_method,
            "chunk_size": args.chunk_size,
            "chunk_overlap": args.chunk_overlap,
            "embedding_model": args.model,
            "topK": 5,
            "similarity_threshold": args.similarity_threshold,
            "min_chunk_chars": args.min_chunk_chars,
            "query_k_multiplier": 4,
            "index_dir": args.index_dir.replace("\\", "/"),
            "collection_name": args.collection_name,
        }
    ]
    write_json(args.config_output, config)

    print("=== Facebook crawl index build complete ===")
    print(f"Reviews       : {len(reviews)}")
    print(f"Documents     : {count}")
    print(f"Index dir     : {args.index_dir}")
    print(f"Meta          : {os.path.join(args.index_dir, META_FILE_NAME)}")
    print(f"Config output : {args.config_output}")


if __name__ == "__main__":
    main()
