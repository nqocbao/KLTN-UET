"""Debug retrieval: print expected vs retrieved review_ids for first N testcases."""
import os
import sys
import json
import argparse

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from rag.food_reviews_rag import FoodReviewRagService


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cases", type=int, default=5)
    ap.add_argument("--model", default="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
    ap.add_argument("--min-score", type=float, default=0.0)
    ap.add_argument("--top-k", type=int, default=10)
    ap.add_argument("--testcases", default=os.path.join(CURRENT_DIR, "testcases_vivutravel_500_mapped.json"))
    ap.add_argument("--backend", default="http://127.0.0.1:5000")
    ap.add_argument("--no-rerank", action="store_true", help="Bypass rerank+collapse, sort by raw cosine similarity")
    args = ap.parse_args()

    if args.no_rerank:
        import rag.food_reviews_rag as frr
        frr.rerank_items = lambda items, location_hint, dish_hints: [
            type(it)(**{**it.__dict__, "final_score": it.similarity}) for it in items
        ]
        frr.collapse_results = lambda items: items

    service = FoodReviewRagService(
        backend_url=args.backend,
        model_name=args.model,
        chunking_method="sentence",
        chunk_size=800,
        chunk_overlap=120,
        min_chunk_chars=120,
        top_k=args.top_k,
        min_score=args.min_score,
        query_k_multiplier=4,
    )

    with open(args.testcases, encoding="utf-8") as f:
        data = json.load(f)
    cases = [c for c in data["testcases"] if c.get("expected_chunk_id")][: args.cases]

    matches = 0
    for c in cases:
        print("=" * 90)
        expected = c["expected_chunk_id"]
        print(f"test_id           : {c['test_id']}")
        print(f"expected_review_id: {expected}")
        print(f"question (first 200): {c['question'][:200]}")

        items = service.query(c["question"])
        print(f"retrieved {len(items)} items (top-{args.top_k}, min_score={args.min_score}):")
        hit = False
        for i, it in enumerate(items, 1):
            mark = " " * 3
            if it.review_id == expected:
                mark = " >>"
                hit = True
            print(
                f"  {mark} #{i:2d} review_id={it.review_id} "
                f"chunk={it.chunk_id} sim={it.similarity:.3f} "
                f"final={it.final_score:.3f} city={it.city or '-'}"
            )
        if hit:
            matches += 1
        else:
            print("  [NO HIT in top-K]")

    print("=" * 90)
    print(f"Total cases: {len(cases)}, hits: {matches}, hit_rate: {matches/len(cases) if cases else 0:.2%}")


if __name__ == "__main__":
    main()
