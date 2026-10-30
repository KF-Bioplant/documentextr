from __future__ import annotations

import base64
import binascii
import logging
import re
from typing import Any, Optional

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from starlette.datastructures import UploadFile

from .. import storage
from ..config import DEFAULT_MODEL, MAX_UPLOAD_FILE_SIZE, MAX_UPLOAD_FILES
from ..extraction import DEFAULT_FILE_NAME, consolidate_and_merge_candidate_records, extract_employee_records_from_parts
from ..gemini_client import GeminiAccountError

logger = logging.getLogger("api.extract")

router = APIRouter(prefix="/api", tags=["extraction"])


def _error(status: int, message: str) -> JSONResponse:
    return JSONResponse(status_code=status, content={"success": False, "error": message})


def _guess_mime(file_name: str, content_type: Optional[str]) -> str:
    if content_type and content_type != "application/octet-stream":
        return content_type
    return "application/pdf" if file_name.lower().endswith(".pdf") else "image/png"


async def _read_request(request: Request) -> tuple[list[dict], dict[str, Any]]:
    """Returns (uploaded file parts, other body fields) for multipart, urlencoded or JSON bodies."""
    content_type = request.headers.get("content-type", "")
    if content_type.startswith("application/json"):
        body = await request.json()
        return [], body if isinstance(body, dict) else {}

    form = await request.form(max_files=MAX_UPLOAD_FILES, max_fields=100)
    parts: list[dict] = []
    fields: dict[str, Any] = {}
    for key, value in form.multi_items():
        if isinstance(value, UploadFile):
            if key != "files":
                continue
            data = await value.read()
            if len(data) > MAX_UPLOAD_FILE_SIZE:
                raise ValueError(f"File too large: {value.filename}")
            file_name = value.filename or DEFAULT_FILE_NAME
            parts.append({"data": data, "mimeType": _guess_mime(file_name, value.content_type), "fileName": file_name})
        else:
            fields[key] = value
    return parts, fields


@router.post("/extract")
async def extract(request: Request):
    try:
        parts, fields = await _read_request(request)
    except ValueError as err:
        return _error(400, str(err) or "File upload failed")
    except Exception as err:  # noqa: BLE001 - malformed multipart bodies
        return _error(400, f"File upload failed: {err}")

    requested_model = str(fields.get("model") or request.headers.get("x-model-name") or DEFAULT_MODEL)

    try:
        # Legacy single-document base64 payload
        if not parts and fields.get("fileData") and fields.get("mimeType"):
            file_name = str(fields.get("fileName") or DEFAULT_FILE_NAME)
            raw_b64 = re.sub(r"^data:.*?;base64,", "", str(fields["fileData"]))
            try:
                data = base64.b64decode(raw_b64)
            except (binascii.Error, ValueError):
                return _error(400, "fileData is not valid base64")
            records, model_used = await extract_employee_records_from_parts(
                [{"data": data, "mimeType": str(fields["mimeType"]), "fileName": file_name}],
                file_name,
                requested_model,
            )
            await storage.save_records(records)
            return {"success": True, "record": records[0], "records": records, "modelUsed": model_used}

        if not parts:
            return _error(400, "No PDF or image file uploaded")

        try:
            # Joint multi-document extraction with candidate merging / separation
            records, model_used = await extract_employee_records_from_parts(parts, parts[0]["fileName"], requested_model)
            records = consolidate_and_merge_candidate_records(records)
            if not records:
                raise ValueError("Batch extraction returned no records.")
            await storage.save_records(records)
            return {"success": True, "record": records[0], "records": records, "modelUsed": model_used}
        except GeminiAccountError:
            raise  # per-file retries would hit the same rejected key
        except Exception as joint_err:  # noqa: BLE001
            logger.warning("Joint extraction failed, falling back to per-file extraction: %s", joint_err)

        # Resilient fallback: process each file on its own
        extracted: list[dict] = []
        errors: list[str] = []
        final_model = requested_model
        for part in parts:
            try:
                file_records, model_used = await extract_employee_records_from_parts([part], part["fileName"], requested_model)
                extracted.extend(file_records)
                final_model = model_used
            except Exception as file_err:  # noqa: BLE001
                logger.error("Error processing file %s: %s", part["fileName"], file_err)
                errors.append(f"{part['fileName']}: {file_err or 'Failed'}")

        consolidated = consolidate_and_merge_candidate_records(extracted)
        if not consolidated:
            return _error(500, f"Failed to extract data from uploaded files. {', '.join(errors)}")

        await storage.save_records(consolidated)
        response: dict[str, Any] = {
            "success": True,
            "record": consolidated[0],
            "records": consolidated,
            "modelUsed": final_model,
        }
        if errors:
            response["warnings"] = errors
        return response
    except GeminiAccountError as err:
        logger.error("Gemini API key rejected: %s", err)
        return _error(402, str(err))
    except Exception as err:  # noqa: BLE001
        logger.exception("Error during AI form extraction")
        return _error(500, str(err) or "Failed to extract form data using Gemini AI.")
