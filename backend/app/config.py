"""Environment-driven settings, loaded from backend/.env."""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BACKEND_DIR / ".env")

_PLACEHOLDER_KEYS = {"MY_GEMINI_API_KEY", "MY_GEMINI_KEY"}

DEFAULT_CANDIDATE_MODELS = [
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-3.7-flash",
    "gemini-3.8-flash",
    "gemini-3.1-pro-preview",
]
DEFAULT_MODEL = "gemini-3.5-flash-lite"


def _env(name: str, default: str = "") -> str:
    return (os.getenv(name) or default).strip()


def get_available_api_keys() -> list[str]:
    """Primary key first, then any configured fallback keys; placeholders are skipped.

    Re-reads backend/.env on each call so key changes apply without restarting the server.
    """
    load_dotenv(BACKEND_DIR / ".env", override=True)
    candidates = [
        _env("GEMINI_API_KEY"),
        _env("GEMINI_API_KEY_SECONDARY"),
        _env("GEMINI_API_KEY_2"),
        _env("GEMINI_API_KEY_FALLBACK"),
    ]
    return [k for k in candidates if k and k not in _PLACEHOLDER_KEYS]


def get_configured_models() -> list[str]:
    configured = _env("GEMINI_MODELS") or _env("GEMINI_MODEL_LIST")
    if configured:
        return [m.strip() for m in configured.split(",") if m.strip()]
    return list(DEFAULT_CANDIDATE_MODELS)


MONGODB_URI = _env("MONGODB_URI")
MONGODB_DB = _env("MONGODB_DB", "kf_bio_plant")

_configured_origins = [o.strip().rstrip("/") for o in (_env("CORS_ORIGINS") or "").split(",") if o.strip()]
_default_origins = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"]
CORS_ORIGINS = list(dict.fromkeys(_configured_origins + _default_origins)) if _configured_origins else _default_origins

DATA_DIR = Path(_env("DATA_DIR") or (BACKEND_DIR / "data"))

MAX_UPLOAD_FILES = 50
MAX_UPLOAD_FILE_SIZE = 50 * 1024 * 1024
