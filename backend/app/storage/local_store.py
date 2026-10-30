"""Local JSON file store used as a cache and as the last-resort fallback when no database is reachable."""

from __future__ import annotations

import json
import logging
import threading

from ..config import DATA_DIR

logger = logging.getLogger("storage.local")

FILE_PATH = DATA_DIR / "employees.json"
_lock = threading.Lock()


def read_local_records() -> list[dict]:
    try:
        if FILE_PATH.exists():
            parsed = json.loads(FILE_PATH.read_text(encoding="utf-8"))
            if isinstance(parsed, list):
                return parsed
    except (OSError, json.JSONDecodeError) as err:
        logger.error("Error reading local employee records: %s", err)
    return []


def save_local_records(records: list[dict]) -> None:
    try:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        FILE_PATH.write_text(json.dumps(records, indent=2, ensure_ascii=False), encoding="utf-8")
    except OSError as err:
        logger.error("Error saving local employee records: %s", err)


def upsert_local_record(record: dict) -> None:
    with _lock:
        current = read_local_records()
        for idx, existing in enumerate(current):
            if existing.get("id") == record.get("id"):
                current[idx] = record
                break
        else:
            current.insert(0, record)
        save_local_records(current)


def delete_local_record(record_id: str) -> None:
    with _lock:
        save_local_records([r for r in read_local_records() if r.get("id") != record_id])
