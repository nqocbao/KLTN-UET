"""TC-RAG-RET-* — wrapper gọi eval_rag_deepeval.py ở chế độ retrieval-only."""
import json
import os
import subprocess
import sys
import time
from pathlib import Path

import pytest


PROJECT_ROOT = Path(__file__).resolve().parents[2]
CHATBOT_DIR = PROJECT_ROOT / "chatbot"
RAG_DIR = CHATBOT_DIR / "rag"


def _venv_python() -> str:
    candidates = [
        CHATBOT_DIR / "venv_rag_eval" / "Scripts" / "python.exe",
        CHATBOT_DIR / "venv_rag_eval" / "bin" / "python",
        CHATBOT_DIR / "venv" / "Scripts" / "python.exe",
        CHATBOT_DIR / "venv" / "bin" / "python",
    ]
    for c in candidates:
        if c.exists():
            return str(c)
    return sys.executable


@pytest.mark.timeout(900)
def test_rag_smoke_5_cases():
    py = _venv_python()
    run_id = f"pytest_smoke_{int(time.time())}"
    cmd = [
        py,
        str(RAG_DIR / "eval_rag_deepeval.py"),
        "--testcases", str(RAG_DIR / "testcases_vivutravel_500_remapped.json"),
        "--configs", str(RAG_DIR / "rag_configs.json"),
        "--limit", "5",
        "--skip-deepeval",
        "--llm-provider", "none",
        "--run-id", run_id,
    ]
    proc = subprocess.run(cmd, cwd=str(CHATBOT_DIR), capture_output=True, text=True, timeout=900)
    assert proc.returncode == 0, f"RAG eval failed:\nSTDOUT:{proc.stdout}\nSTDERR:{proc.stderr}"

    summary_file = RAG_DIR / "outputs" / f"rag_eval_summary_{run_id}.json"
    assert summary_file.exists(), f"Missing summary file: {summary_file}"

    with summary_file.open("r", encoding="utf-8") as f:
        summary = json.load(f)
    assert isinstance(summary, list) and len(summary) >= 1
    for cfg in summary:
        # smoke chỉ assert có chạy, không assert ngưỡng (smoke set quá nhỏ)
        assert "config_id" in cfg
        assert "average_latency_ms" in cfg or "Recall@5" in cfg or "average_mrr" in cfg
