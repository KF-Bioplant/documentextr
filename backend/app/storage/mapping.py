"""Mapping between the API's employee record shape and the `employees` table columns."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

# (record key, column name) for every plain text column
FIELD_COLUMNS: list[tuple[str, str]] = [
    ("COMPANY", "company"),
    ("DESIG_CODE", "desig_code"),
    ("F_DESIG_CODE", "f_desig_code"),
    ("DEPT_CODE", "dept_code"),
    ("F_DEPT_CODE", "f_dept_code"),
    ("SECTION_CODE", "section_code"),
    ("F_SECTION_CODE", "f_section_code"),
    ("codeMappingStatus", "code_mapping_status"),
    ("BIRTH_DT", "birth_dt"),
    ("Gender", "gender"),
    ("MaritalStatus", "marital_status"),
    ("DESIG", "desig"),
    ("JOIN_DT", "join_dt"),
    ("PRB_DT", "prb_dt"),
    ("CONF_DT", "conf_dt"),
    ("DEPT_NAME", "dept_name"),
    ("LabDetails", "lab_details"),
    ("EPAN_NO", "epan_no"),
    ("EMAILID", "email_id"),
    ("Address1", "address_1"),
    ("Address2", "address_2"),
    ("Pin1", "pin_1"),
    ("Pin 2", "pin_2"),
    ("ADHAR_NO", "adhar_no"),
    ("PF_UAN", "pf_uan"),
    ("ESI_Number", "esi_number"),
    ("EMP_MobileNumber", "emp_mobile_number"),
    ("Alternate_MobileNumber", "alternate_mobile_number"),
    ("FatherName", "father_name"),
    ("FatherDOB", "father_dob"),
    ("MotherName", "mother_name"),
    ("MotherDOB", "mother_dob"),
    ("SpouseName", "spouse_name"),
    ("SpouseDOB", "spouse_dob"),
    ("Child1", "child_1"),
    ("Child1DOB", "child_1_dob"),
    ("Child2", "child_2"),
    ("Child2DOB", "child_2_dob"),
    ("Qualification", "qualification"),
    ("PreviousEmployment", "previous_employment"),
    ("PresentEmployment", "present_employment"),
    ("PreviousExperience", "previous_experience"),
    ("CurrentExperience", "current_experience"),
    ("TotalExperience", "total_experience"),
    ("ReferenceName", "reference_name"),
]

TABLE_COLUMNS: list[str] = [
    "id", "file_name", "uploaded_at", "confidence_score", "name",
    *(column for _, column in FIELD_COLUMNS),
    "extended_details",
]


def _iso(value: Any) -> str:
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, str) and value:
        try:
            return datetime.fromisoformat(value.replace("Z", "+00:00")).isoformat()
        except ValueError:
            pass
    return datetime.now(timezone.utc).isoformat()


def record_to_row(rec: dict) -> dict:
    confidence = rec.get("confidenceScore")
    row: dict[str, Any] = {
        "id": rec.get("id"),
        "file_name": rec.get("fileName") or "document.pdf",
        "uploaded_at": _iso(rec.get("uploadedAt")),
        "confidence_score": int(round(confidence)) if isinstance(confidence, (int, float)) else 95,
        "name": rec.get("NAME") or "Unnamed Record",
        "extended_details": rec.get("extendedDetails") or {},
    }
    for key, column in FIELD_COLUMNS:
        row[column] = rec.get(key) or None
    return row


def row_to_record(row: dict) -> dict:
    uploaded_at = row.get("uploaded_at")
    if isinstance(uploaded_at, datetime):
        uploaded_at = uploaded_at.isoformat()
    confidence = row.get("confidence_score")
    rec: dict[str, Any] = {
        "id": row.get("id"),
        "fileName": row.get("file_name") or "document.pdf",
        "uploadedAt": uploaded_at or datetime.now(timezone.utc).isoformat(),
        "confidenceScore": 95 if confidence is None else confidence,
        "NAME": row.get("name") or "-",
        "extendedDetails": row.get("extended_details") or {},
    }
    for key, column in FIELD_COLUMNS:
        rec[key] = row.get(column) or "-"
    if rec["codeMappingStatus"] == "-":
        rec["codeMappingStatus"] = "UNMAPPED"
    return rec
