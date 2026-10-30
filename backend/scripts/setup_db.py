"""Creates the `employees` collection (validator + indexes) in the configured MongoDB database,
then imports any records from the local JSON cache (backend/data/employees.json).

Run from the backend folder:  python -m scripts.setup_db
"""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import config  # noqa: E402
from app.storage import mongo_store  # noqa: E402
from app.storage.local_store import read_local_records  # noqa: E402


async def main() -> int:
    if not mongo_store.is_configured():
        print("Set MONGODB_URI in backend/.env first.")
        return 1
    client = mongo_store.get_client()
    print("Connecting to MongoDB...")
    await client.admin.command("ping")
    print(f"Connected. Creating '{mongo_store.COLLECTION}' collection in database '{config.MONGODB_DB}'...")
    await mongo_store.ensure_schema()
    print("Collection, validator and indexes are ready.")

    local = read_local_records()
    if local:
        print(f"Importing {len(local)} record(s) from the local JSON cache...")
        if not await mongo_store.upsert_employees(local):
            print("Import failed; see the warning above.")
            return 1
    count = await client[config.MONGODB_DB][mongo_store.COLLECTION].count_documents({})
    print(f"Done. The collection holds {count} record(s).")
    await client.close()
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
