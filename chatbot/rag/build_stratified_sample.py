"""Build a stratified sample from a foodtour-clean testcases file.

Equal-per-type sampling. For each question_type we draw up to N cases at random
with a fixed seed. If a type has fewer cases than N, we take them all and the
shortfall is redistributed proportionally to the remaining types (largest types
absorb the remainder first) so the final total equals the requested size.
"""

from __future__ import annotations

import argparse
import json
import random
from collections import defaultdict
from pathlib import Path
from typing import Dict, List


def load_cases(path: Path) -> Dict:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def build_groups(cases: List[Dict]) -> Dict[str, List[Dict]]:
    groups: Dict[str, List[Dict]] = defaultdict(list)
    for case in cases:
        qtype = case.get("question_type") or "unknown"
        groups[qtype].append(case)
    return groups


def stratify(
    groups: Dict[str, List[Dict]],
    total: int,
    seed: int,
) -> List[Dict]:
    rng = random.Random(seed)
    types = sorted(groups.keys())
    if not types:
        return []

    base_share = total // len(types)
    quotas: Dict[str, int] = {t: base_share for t in types}
    leftover = total - base_share * len(types)
    for t in sorted(types, key=lambda x: -len(groups[x]))[:leftover]:
        quotas[t] += 1

    picked: List[Dict] = []
    short: Dict[str, int] = {}
    for t in types:
        pool = list(groups[t])
        rng.shuffle(pool)
        take = min(quotas[t], len(pool))
        picked.extend(pool[:take])
        if take < quotas[t]:
            short[t] = quotas[t] - take

    deficit = sum(short.values())
    if deficit:
        donors = sorted(
            (t for t in types if t not in short and len(groups[t]) > quotas[t]),
            key=lambda x: -(len(groups[x]) - quotas[x]),
        )
        for t in donors:
            if deficit <= 0:
                break
            already = quotas[t]
            extra = min(deficit, len(groups[t]) - already)
            pool = list(groups[t])
            rng.shuffle(pool)
            picked.extend(pool[already : already + extra])
            deficit -= extra

    picked.sort(key=lambda c: c.get("id") or c.get("test_id") or "")
    return picked


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--src", required=True, help="Path to source testcases JSON")
    parser.add_argument("--out", required=True, help="Path to write stratified subset")
    parser.add_argument("--total", type=int, default=100)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    payload = load_cases(Path(args.src))
    cases = payload.get("testcases") if isinstance(payload, dict) else payload
    if not isinstance(cases, list):
        raise SystemExit("Source file does not contain a testcases list")

    groups = build_groups(cases)
    sampled = stratify(groups, args.total, args.seed)

    counts: Dict[str, int] = defaultdict(int)
    for c in sampled:
        counts[c.get("question_type") or "unknown"] += 1

    out_payload = {
        "schema_version": payload.get("schema_version") if isinstance(payload, dict) else None,
        "created_at": payload.get("created_at") if isinstance(payload, dict) else None,
        "source_file": args.src,
        "notes": [
            f"Stratified subset of {len(sampled)} testcases (equal-per-type) drawn with seed={args.seed}.",
            "When a type has fewer cases than its quota, the shortfall is reassigned to larger types.",
        ],
        "summary": {
            "total": len(sampled),
            "by_question_type": dict(counts),
            "seed": args.seed,
        },
        "thresholds": payload.get("thresholds") if isinstance(payload, dict) else None,
        "testcases": sampled,
    }

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", encoding="utf-8") as f:
        json.dump(out_payload, f, ensure_ascii=False, indent=2)

    print(f"[done] Wrote {len(sampled)} cases to {out_path}")
    print(f"[done] Per-type counts: {dict(counts)}")


if __name__ == "__main__":
    main()
