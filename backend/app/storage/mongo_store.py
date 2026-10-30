"""MongoDB access to the `employees` collection. Every call fails soft and reports success as a bool.

Enabled only when MONGODB_URI is configured.
"""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Optional

import certifi
from pymongo import ASCENDING, DESCENDING, AsyncMongoClient, ReplaceOne
from pymongo.errors import CollectionInvalid, PyMongoError

from .. import config
from .mapping import record_to_row, row_to_record

logger = logging.getLogger("storage.mongo")

COLLECTION = "employees"

# Required fields and types enforced by the collection validator; every other field is optional.
EMPLOYEE_SCHEMA = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["_id", "file_name", "uploaded_at", "name"],
        "properties": {
            "_id": {"bsonType": "string"},
            "file_name": {"bsonType": "string"},
            "uploaded_at": {"bsonType": "date"},
            "confidence_score": {"bsonType": ["int", "long", "double", "null"]},
            "name": {"bsonType": "string"},
            "extended_details": {"bsonType": ["object", "null"]},
        },
    }
}

INDEXES = [
    ([("uploaded_at", DESCENDING)], "uploaded_at_desc"),
    ([("name", ASCENDING)], "name"),
    ([("company", ASCENDING), ("dept_code", ASCENDING)], "company_dept"),
]

_client: Optional[AsyncMongoClient] = None


def is_configured() -> bool:
    return bool(config.MONGODB_URI)


def get_client() -> AsyncMongoClient:
    global _client
    if _client is None:
        _client = AsyncMongoClient(
            config.MONGODB_URI, serverSelectionTimeoutMS=5000, tz_aware=True, tlsCAFile=certifi.where()
        )
    return _client


def _collection():
    return get_client()[config.MONGODB_DB][COLLECTION]


def _to_document(rec: dict) -> dict:
    doc = record_to_row(rec)
    doc["_id"] = doc.pop("id")
    doc["uploaded_at"] = datetime.fromisoformat(doc["uploaded_at"])
    return doc


def _from_document(doc: dict) -> dict:
    doc["id"] = doc.pop("_id")
    return row_to_record(doc)


async def ensure_schema() -> None:
    """Create the collection with its validator (or refresh the validator) and build the indexes."""
    db = get_client()[config.MONGODB_DB]
    try:
        await db.create_collection(COLLECTION, validator=EMPLOYEE_SCHEMA)
    except CollectionInvalid:
        await db.command("collMod", COLLECTION, validator=EMPLOYEE_SCHEMA)
    for keys, name in INDEXES:
        await db[COLLECTION].create_index(keys, name=name)


async def fetch_employees() -> Optional[list[dict]]:
    if not is_configured():
        return None
    try:
        cursor = _collection().find().sort("uploaded_at", DESCENDING)
        return [_from_document(doc) async for doc in cursor]
    except PyMongoError as err:
        logger.warning("MongoDB fetch error: %s", err)
        return None


async def upsert_employees(records: list[dict]) -> bool:
    if not records:
        return True
    if not is_configured():
        return False
    try:
        ops = [ReplaceOne({"_id": doc["_id"]}, doc, upsert=True) for doc in map(_to_document, records)]
        await _collection().bulk_write(ops, ordered=False)
        return True
    except PyMongoError as err:
        logger.warning("MongoDB upsert error: %s", err)
        return False


async def delete_employee(record_id: str) -> bool:
    if not is_configured():
        return False
    try:
        await _collection().delete_one({"_id": record_id})
        return True
    except PyMongoError as err:
        logger.warning("MongoDB delete error: %s", err)
        return False
