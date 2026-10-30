"""Sorting and bullet formatting for qualifications and employment history.

Python port of frontend/src/utils/listFormatter.ts.
"""

from __future__ import annotations

import re
from datetime import date
from typing import Any, Optional, Union

from .company_codes import parse_date

Item = Union[dict[str, Any], str]

_NO_DATE = 10**12


def _s(value: Any) -> str:
    return "" if value is None else str(value)


def get_qualification_rank(item: Item) -> float:
    """Ranks education: 10th(1) < 12th(2) < Diploma(3) < Bachelors(4) < Masters(5) < PhD(6)."""
    if isinstance(item, str):
        text = level = course = item.lower()
    else:
        level = _s(item.get("level")).lower()
        course = _s(item.get("courseName")).lower()
        text = f"{level} {course} {_s(item.get('institute'))} {_s(item.get('boardUniversity'))}".lower()

    def has(pattern: str, target: str) -> bool:
        return re.search(pattern, target, re.IGNORECASE) is not None

    if has(r"\b(ph\.?d|doctorate|doctor of philosophy|post\s*doc|d\.?sc|d\.?litt)\b", text) or (
        "phd" in level or "doctorate" in level
    ):
        return 6

    if (
        has(
            r"\b(m\.?sc|msc|m\.?tech|mtech|mba|pgdm|m\.?com|mcom|m\.?a|m\.?e|mca|m\.?pharm|mpharm|ms|m\.?phil"
            r"|m\.?des|llm|post\s*grad|post\s*graduate|pg|master|masters)\b",
            text,
        )
        or has(r"\b(post\s*graduation|post\s*graduate|pg)\b", level)
        or has(r"\b(master|masters)\b", course)
        or has(r"\b(master|masters)\b", level)
    ):
        return 5

    if (
        has(
            r"\b(b\.?sc|bsc|b\.?tech|btech|b\.?e\b|be\b|b\.?a\b|ba\b|b\.?com|bcom|bba|bca|b\.?pharm|bpharm|b\.?ed"
            r"|b\.?des|bhm|b\.?arch|llb|graduation|graduate|under\s*grad|undergraduate|ug|bachelor|bachelors)\b",
            text,
        )
        or has(r"\b(graduation|graduate|ug|under\s*graduation)\b", level)
        or has(r"\b(bachelor|bachelors)\b", course)
        or has(r"\b(bachelor|bachelors)\b", level)
    ):
        return 4

    if has(r"\b(diploma|polytechnic|iti|d\.?pharm|d\.?ed|d\.?el\.?ed|post\s*diploma)\b", text) or (
        "diploma" in level or "diploma" in course
    ):
        return 3

    if has(
        r"\b(12th|12\b|xii\b|xii\s*std|hsc|intermediate|inter|higher\s*secondary|plus\s*two|\+2|junior\s*college|10\+2)\b",
        text,
    ) or any(k in level for k in ("12", "xii", "hsc", "inter")):
        return 2

    if has(r"\b(10th|10\b|x\b|x\s*std|ssc|sslc|matric|matriculation|secondary|high\s*school)\b", text) or any(
        k in level for k in ("10", "x std", "ssc", "matric")
    ):
        return 1

    return 3.5


def _extract_pass_year(item: Item) -> int:
    if not isinstance(item, str) and item.get("passYear"):
        digits = re.sub(r"\D", "", _s(item.get("passYear")))
        if digits:
            year = int(digits)
            if 1950 < year < 2100:
                return year
    text = item if isinstance(item, str) else f"{item.get('courseName')} {item.get('level')} {item.get('institute')}"
    m = re.search(r"\b(19\d{2}|20\d{2})\b", text)
    return int(m.group(1)) if m else 9999


def sort_academic_qualifications(academics: Any) -> list:
    """Sorts academics lowest to highest (10th -> PhD), then by passing year."""
    if not isinstance(academics, list) or len(academics) <= 1:
        return academics or []
    items = [a for a in academics if isinstance(a, dict)]
    return sorted(items, key=lambda a: (get_qualification_rank(a), _extract_pass_year(a)))


def format_single_academic_line(item: dict[str, Any]) -> str:
    parts: list[str] = []

    title = _s(item.get("courseName") or item.get("level") or "Degree").strip()
    level_norm = _s(item.get("level")).strip()
    if level_norm and level_norm.lower() not in title.lower():
        if re.match(r"^(10th|10|x|xii|12th|12|ssc|hsc|diploma|graduation|post\s*graduation|phd)", level_norm, re.I):
            title = f"{level_norm}: {title}"
    parts.append(title)

    inst_parts = [p for p in (_s(item.get("institute")).strip(), _s(item.get("boardUniversity")).strip()) if p and p != "-"]
    unique_inst = " / ".join(dict.fromkeys(inst_parts))
    if unique_inst:
        parts.append(f"({unique_inst})")

    meta: list[str] = []
    if item.get("passYear") and item.get("passYear") != "-":
        meta.append(_s(item.get("passYear")).strip())
    if item.get("percentageOrCgpa") and item.get("percentageOrCgpa") != "-":
        meta.append(_s(item.get("percentageOrCgpa")).strip())
    if meta:
        parts.append(f"[{', '.join(meta)}]")

    return f"• {' '.join(parts)}"


def _strip_bullet(text: str) -> str:
    return re.sub(r"^[•\-*\s]+", "", text.strip())


def format_qualifications_list(academics: Optional[list] = None, fallback_text: Optional[str] = None) -> str:
    if isinstance(academics, list) and academics:
        valid = [a for a in academics if isinstance(a, dict) and (a.get("courseName") or a.get("level") or a.get("institute"))]
        if valid:
            return "\n".join(format_single_academic_line(a) for a in sort_academic_qualifications(valid))

    if not fallback_text or fallback_text == "-" or not fallback_text.strip():
        return ""

    raw_lines = [
        _strip_bullet(s)
        for s in re.split(
            r"\r?\n|•|;|,(?=\s*(?:10th|12th|ssc|hsc|diploma|b\.?sc|b\.?tech|b\.?e|b\.?a|b\.?com|bachelor|m\.?sc"
            r"|m\.?tech|mba|m\.?com|m\.?a|master|ph\.?d))",
            fallback_text,
            flags=re.IGNORECASE,
        )
    ]
    raw_lines = [s for s in raw_lines if s]
    if not raw_lines:
        return fallback_text

    raw_lines.sort(key=lambda line: (get_qualification_rank(line), _extract_pass_year(line)))
    return "\n".join(f"• {line}" for line in raw_lines)


def _ordinal(d: date) -> int:
    return d.toordinal()


def _year_start(text: str) -> Optional[int]:
    m = re.search(r"\b(19\d{2}|20\d{2})\b", text)
    return _ordinal(date(int(m.group(1)), 1, 1)) if m else None


def _first_dmy(text: str) -> Optional[int]:
    m = re.search(r"(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})", text)
    if m:
        d = parse_date(m.group(0))
        if d:
            return _ordinal(d)
    return None


def _extract_job_start_value(job: Item) -> int:
    """Approximate start date (as ordinal) for chronological sorting."""
    if isinstance(job, str):
        value = _first_dmy(job)
        if value is None:
            value = _year_start(job)
        return _NO_DATE if value is None else value

    from_dt = _s(job.get("fromDate"))
    if from_dt and from_dt != "-":
        d = parse_date(from_dt)
        if d:
            return _ordinal(d)
        value = _year_start(from_dt)
        if value is not None:
            return value

    duration = _s(job.get("duration"))
    if duration and duration != "-":
        value = _first_dmy(duration)
        if value is None:
            value = _year_start(duration)
        if value is not None:
            return value

    to_dt = _s(job.get("toDate"))
    if to_dt and to_dt != "-":
        d = parse_date(to_dt)
        if d:
            return _ordinal(d)

    return _NO_DATE


def sort_previous_employments(jobs: Any) -> list:
    """Sorts previous jobs oldest first."""
    if not isinstance(jobs, list) or len(jobs) <= 1:
        return jobs or []
    items = [j for j in jobs if isinstance(j, dict)]
    return sorted(items, key=_extract_job_start_value)


def format_single_previous_job_line(job: dict[str, Any]) -> str:
    parts: list[str] = [_s(job.get("organizationName") or "Previous Company").strip()]

    if job.get("lastDesignation") and job.get("lastDesignation") != "-":
        parts.append(f"- {_s(job.get('lastDesignation')).strip()}")

    from_dt, to_dt, duration = job.get("fromDate"), job.get("toDate"), job.get("duration")
    duration_str = ""
    if from_dt and to_dt and from_dt != "-" and to_dt != "-":
        duration_str = f"{from_dt} to {to_dt}"
    elif duration and duration != "-":
        duration_str = _s(duration).strip()
    elif from_dt and from_dt != "-":
        duration_str = f"From {from_dt}"
    if duration_str:
        parts.append(f"({duration_str})")

    meta: list[str] = []
    for key, label in (("emoluments", "CTC"), ("industry", "Industry"), ("reasonForLeaving", "Reason")):
        if job.get(key) and job.get(key) != "-":
            meta.append(f"{label}: {_s(job.get(key)).strip()}")
    if meta:
        parts.append(f"[{', '.join(meta)}]")

    return f"• {' '.join(parts)}"


def format_previous_employments_list(jobs: Optional[list] = None, fallback_text: Optional[str] = None) -> str:
    if isinstance(jobs, list) and jobs:
        valid = [
            j for j in jobs
            if isinstance(j, dict)
            and (j.get("organizationName") or j.get("lastDesignation") or j.get("duration") or j.get("fromDate"))
        ]
        if valid:
            return "\n".join(format_single_previous_job_line(j) for j in sort_previous_employments(valid))

    if not fallback_text or fallback_text == "-" or not fallback_text.strip():
        return ""

    raw_lines = [s for s in (_strip_bullet(x) for x in re.split(r"\r?\n|•|;", fallback_text)) if s]
    if not raw_lines:
        return fallback_text

    raw_lines.sort(key=_extract_job_start_value)
    return "\n".join(f"• {line}" for line in raw_lines)


def format_present_employment(present: Optional[str] = None) -> str:
    if not present or present == "-" or not present.strip():
        return ""
    lines = [s for s in (_strip_bullet(x) for x in re.split(r"\r?\n", present)) if s]
    if not lines:
        return present
    return "\n".join(f"• {line}" for line in lines)


def apply_sorted_bulleted_formatting(record: dict[str, Any]) -> dict[str, Any]:
    """Sorts and bullet-formats Qualification, PreviousEmployment and PresentEmployment."""
    ext = record.get("extendedDetails") if isinstance(record.get("extendedDetails"), dict) else {}
    academics = ext.get("academics")
    previous_jobs = ext.get("previousEmployments")

    sorted_academics = sort_academic_qualifications(academics) if academics else None
    sorted_jobs = sort_previous_employments(previous_jobs) if previous_jobs else None

    formatted_qualification = format_qualifications_list(sorted_academics, _s(record.get("Qualification")) or None)
    formatted_previous = format_previous_employments_list(sorted_jobs, _s(record.get("PreviousEmployment")) or None)
    formatted_present = format_present_employment(_s(record.get("PresentEmployment")) or None)

    updated_ext = dict(ext)
    if sorted_academics:
        updated_ext["academics"] = sorted_academics
    if sorted_jobs:
        updated_ext["previousEmployments"] = sorted_jobs

    return {
        **record,
        "Qualification": formatted_qualification or record.get("Qualification") or "",
        "PreviousEmployment": formatted_previous or record.get("PreviousEmployment") or "",
        "PresentEmployment": formatted_present or record.get("PresentEmployment") or "",
        "extendedDetails": updated_ext,
    }
