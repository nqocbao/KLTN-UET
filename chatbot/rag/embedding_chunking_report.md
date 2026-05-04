# Food Review RAG Embedding + Chunking Decision
Date: 2026-05-05

## Dataset snapshot
Source file: .vscode/json/foodtour_HaNoi_Data.json
Sample size: 103 posts

Content length (chars):
- avg: 471
- p50: 378
- p75: 632
- p90: 780
- p95: 982
- max: 2243

Content length (words):
- avg: 106
- p50: 83
- p75: 141
- p90: 179

## Chunking candidates (overlap = 120 chars)
| chunk_size | total_chunks | avg_chunks | p50 | p75 | p90 |
| --- | --- | --- | --- | --- | --- |
| 600 | 138 | 1.34 | 1 | 2 | 2 |
| 800 | 113 | 1.10 | 1 | 1 | 1 |
| 1000 | 109 | 1.06 | 1 | 1 | 1 |

Decision: use 800 chars with 120 overlap.
- p90 length ~780 so most reviews fit in one chunk.
- 600 chars increases chunk count by ~22% vs 800 (138 vs 113), higher index size and latency.
- 1000 chars reduces chunk count slightly but lowers semantic focus when reviews are long.

## Embedding choice
Model: sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
Reasons:
- multilingual model with good Vietnamese coverage.
- small 384-dim embeddings for low latency and low memory footprint.
- strong baseline for semantic search with cosine distance.

Alternatives considered:
- bge-m3 or multilingual-e5-base: better quality but larger and slower for realtime RAG.

## Retrieval scoring
Final score per chunk:
- 0.7 * cosine similarity
- 0.3 * normalized engagement score

Collapse by review_id to show the best chunk per review.

## Runtime config (env)
- RAG_CHUNK_SIZE=800
- RAG_CHUNK_OVERLAP=120
- RAG_MIN_CHUNK_CHARS=120
- RAG_QUERY_K_MULTIPLIER=4

## MRR@5 evaluation
Script: rag/eval_embedding_mrr.py
Queries: rag/eval_queries.json

Run (API data):
```
python rag/eval_embedding_mrr.py --source api --output rag/embedding_eval_results.md
```

Run (raw json fallback):
```
python rag/eval_embedding_mrr.py --source file --data .vscode/json/foodtour_HaNoi_Data.json --output rag/embedding_eval_results.md
```

Models compared by default:
- sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- sentence-transformers/paraphrase-multilingual-mpnet-base-v2
- sentence-transformers/distiluse-base-multilingual-cased-v2

Result table will be written to rag/embedding_eval_results.md.

## Repro (stats script)
Use the python snippet below to recompute dataset stats and chunk counts:

```python
import json
import math
import os
from statistics import mean

path = r"d:\KLTN UET\.vscode\json\foodtour_HaNoi_Data.json"
with open(path, "r", encoding="utf-8") as f:
    data = json.load(f)

texts = [str(item.get("text") or "").strip() for item in data]
texts = [t for t in texts if t]
lengths = [len(t) for t in texts]
words = [len(t.split()) for t in texts]

def percentile(values, p):
    values = sorted(values)
    k = (len(values) - 1) * p
    f, c = math.floor(k), math.ceil(k)
    if f == c:
        return values[int(k)]
    return int(values[f] * (c - k) + values[c] * (k - f))

def split_chunks(text, size=800, overlap=120):
    parts = []
    for raw in text.replace("\r", "\n").split("\n"):
        raw = raw.strip()
        if not raw:
            continue
        parts.extend([p.strip() for p in raw.split(".") if p.strip()])
    chunks, current = [], ""
    for part in parts:
        candidate = f"{current} {part}".strip()
        if len(candidate) <= size:
            current = candidate
            continue
        if current:
            chunks.append(current)
        tail = current[-overlap:] if overlap and current else ""
        current = f"{tail} {part}".strip()
        while len(current) > size:
            chunks.append(current[:size])
            current = current[size - overlap :]
    if current:
        chunks.append(current)
    return chunks

stats = {
    "count": len(texts),
    "len_avg": int(mean(lengths)),
    "len_p50": percentile(lengths, 0.50),
    "len_p75": percentile(lengths, 0.75),
    "len_p90": percentile(lengths, 0.90),
    "len_p95": percentile(lengths, 0.95),
    "len_max": max(lengths),
    "word_avg": int(mean(words)),
    "word_p50": percentile(words, 0.50),
    "word_p75": percentile(words, 0.75),
    "word_p90": percentile(words, 0.90),
}
print(stats)
```
