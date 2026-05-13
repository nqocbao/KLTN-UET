"""Re-generate expected_chunk_id for each testcase using embedding cosine top-1.

For each testcase:
- Use retrieval_context[0] (the original passage) as the search query
- Embed + Chroma top-1 search
- Replace expected_chunk_id with the matched review_id
- Keep original id under "original_expected_chunk_id" + log similarity
"""
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
    ap.add_argument("--input", default=os.path.join(CURRENT_DIR, "testcases_vivutravel_500_mapped.json"))
    ap.add_argument("--output", default=os.path.join(CURRENT_DIR, "testcases_vivutravel_500_remapped.json"))
    ap.add_argument("--model", default="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
    ap.add_argument("--backend", default="http://127.0.0.1:5000")
    ap.add_argument("--limit", type=int, default=0, help="Process only first N (0 = all)")
    args = ap.parse_args()

    service = FoodReviewRagService(
        backend_url=args.backend,
        model_name=args.model,
        chunking_method="sentence",
        chunk_size=800,
        chunk_overlap=120,
        min_chunk_chars=120,
        top_k=5,
        min_score=0.0,
        query_k_multiplier=1,
    )
    service._ensure_index()
    if not service._collection or service._collection.count() == 0:
        raise SystemExit("Empty Chroma collection — check backend / index path")
    col = service._collection
    model = service._get_model()

    with open(args.input, encoding="utf-8") as f:
        data = json.load(f)

    cases = data.get("testcases", [])
    if args.limit and args.limit > 0:
        cases = cases[: args.limit]

    remapped = []
    changed = unchanged = skipped = 0
    sim_buckets = {"<0.7": 0, "0.7-0.8": 0, "0.8-0.9": 0, ">=0.9": 0}

    for idx, c in enumerate(cases, 1):
        ctxs = c.get("retrieval_context") or []
        text = (ctxs[0] if ctxs else "").strip()
        if not text:
            skipped += 1
            new_case = dict(c)
            new_case["remap_status"] = "skipped_empty_context"
            remapped.append(new_case)
            continue

        emb = model.encode([text], normalize_embeddings=True)[0].tolist()
        res = col.query(query_embeddings=[emb], n_results=1, include=["metadatas", "distances"])
        metas = res["metadatas"][0] if res.get("metadatas") else []
        dists = res["distances"][0] if res.get("distances") else []
        if not metas or not dists:
            skipped += 1
            new_case = dict(c)
            new_case["remap_status"] = "skipped_no_match"
            remapped.append(new_case)
            continue

        new_id = metas[0].get("review_id")
        sim = max(0.0, 1.0 - float(dists[0]))
        old_id = c.get("expected_chunk_id")

        if sim < 0.7:
            sim_buckets["<0.7"] += 1
        elif sim < 0.8:
            sim_buckets["0.7-0.8"] += 1
        elif sim < 0.9:
            sim_buckets["0.8-0.9"] += 1
        else:
            sim_buckets[">=0.9"] += 1

        new_case = dict(c)
        new_case["original_expected_chunk_id"] = old_id
        new_case["expected_chunk_id"] = new_id
        new_case["remap_match_method"] = "embedding_top1"
        new_case["remap_match_similarity"] = round(sim, 4)
        new_case["remap_status"] = "ok"
        remapped.append(new_case)

        if new_id == old_id:
            unchanged += 1
        else:
            changed += 1

        if idx % 50 == 0:
            print(f"  processed {idx}/{len(cases)} (changed={changed} unchanged={unchanged} skipped={skipped})")

    new_data = dict(data)
    new_data["testcases"] = remapped
    new_data["remapping_strategy"] = "embedding cosine top-1 against retrieval_context"
    new_data["remapping_model"] = args.model
    new_data["remapping_summary"] = {
        "total": len(cases),
        "changed": changed,
        "unchanged": unchanged,
        "skipped": skipped,
        "similarity_buckets": sim_buckets,
    }

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(new_data, f, ensure_ascii=False, indent=2)

    print("\n=== Remap done ===")
    print(f"Total      : {len(cases)}")
    print(f"Changed    : {changed}")
    print(f"Unchanged  : {unchanged}")
    print(f"Skipped    : {skipped}")
    print(f"Similarity : {sim_buckets}")
    print(f"Saved to   : {args.output}")


if __name__ == "__main__":
    main()
