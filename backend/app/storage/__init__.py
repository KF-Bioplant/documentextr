"""Employee record persistence: MongoDB as the primary store, local JSON always kept in sync as cache / fallback."""

from __future__ import annotations

from . import mongo_store
from .local_store import delete_local_record, read_local_records, save_local_records, upsert_local_record


async def list_records() -> list[dict]:
    records = await mongo_store.fetch_employees()
    if records:
        save_local_records(records)
        return records
    return read_local_records()


async def save_records(records: list[dict]) -> None:
    if not records:
        return
    for record in records:
        upsert_local_record(record)
    await mongo_store.upsert_employees(records)


async def update_record(record: dict) -> None:
    upsert_local_record(record)
    await mongo_store.upsert_employees([record])


async def delete_record(record_id: str) -> None:
    delete_local_record(record_id)
    await mongo_store.delete_employee(record_id)


__all__ = ["list_records", "save_records", "update_record", "delete_record"]
