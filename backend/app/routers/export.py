from __future__ import annotations

import logging
import time

from fastapi import APIRouter, Body
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import JSONResponse, Response

from ..excel_export import build_employee_workbook
from ..extraction import enrich_incoming_record

logger = logging.getLogger("api.export")

router = APIRouter(prefix="/api", tags=["export"])

XLSX_MEDIA_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"


@router.post("/export-excel")
async def export_excel(payload: dict = Body(...)):
    input_records = payload.get("records") or []
    if not isinstance(input_records, list) or not input_records:
        return JSONResponse(status_code=400, content={"success": False, "error": "No records provided for Excel export"})

    try:
        records = [enrich_incoming_record(r) for r in input_records if isinstance(r, dict)]
        content = await run_in_threadpool(build_employee_workbook, records)
    except Exception as err:  # noqa: BLE001
        logger.exception("Error generating Excel file")
        return JSONResponse(status_code=500, content={"success": False, "error": str(err) or "Failed to generate Excel spreadsheet"})

    file_name = f"KF_Futura_Employee_Data_{int(time.time() * 1000)}.xlsx"
    return Response(
        content=content,
        media_type=XLSX_MEDIA_TYPE,
        headers={"Content-Disposition": f"attachment; filename={file_name}"},
    )
