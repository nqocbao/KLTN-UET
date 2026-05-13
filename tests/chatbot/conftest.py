import os

import pytest
import requests


RASA_URL = os.getenv("RASA_URL", "http://localhost:5005")
BACKEND_URL = os.getenv("BACKEND_API_URL", "http://localhost:5000")


def _is_up(url: str) -> bool:
    try:
        r = requests.get(url, timeout=3)
        return r.status_code < 500
    except Exception:
        return False


@pytest.fixture(scope="session")
def rasa_up() -> bool:
    return _is_up(f"{RASA_URL}/")


@pytest.fixture(scope="session")
def backend_up() -> bool:
    return _is_up(f"{BACKEND_URL}/")
