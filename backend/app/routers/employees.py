from __future__ import annotations

import logging

from fastapi import APIRouter, Body
from fastapi.responses import JSONResponse

from .. import storage

logger = logging.getLogger("api.employees")

router = APIRouter(prefix="/api/employees", tags=["employees"])


@router.get("")
async def list_employees():
    return {"success": True, "records": await storage.list_records()}


@router.put("/{record_id}")
async def update_employee(record_id: str, record: dict = Body(...)):
    try:
        record["id"] = record.get("id") or record_id
        await storage.update_record(record)
        return {"success": True}
    except Exception:  # noqa: BLE001
        logger.exception("Failed to update record %s", record_id)
        return JSONResponse(status_code=500, content={"success": False, "error": "Failed to update record"})


@router.delete("/{record_id}")
async def delete_employee(record_id: str):
    try:
        await storage.delete_record(record_id)
        return {"success": True}
    except Exception:  # noqa: BLE001
        logger.exception("Failed to delete record %s", record_id)
        return JSONResponse(status_code=500, content={"success": False, "error": "Failed to delete record"})
