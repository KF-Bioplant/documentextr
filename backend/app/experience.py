"""Previous / current / total work-experience calculation.

Python port of frontend/src/utils/experienceCalculator.ts.
"""

from __future__ import annotations

import math
import re
from datetime import date
from typing import Any, Optional

from .company_codes import days_in_month, parse_date

def js_round(value: float) -> int:
    """Rounds half up like JavaScript's Math.round (Python's round() is banker's rounding)."""
    return math.floor(value + 0.5)


_EMPTY_MARKERS = re.compile(r"^(none|fresher|na|n/a|-|nil|no)$", re.IGNORECASE)


def format_months_to_experience(months: float, short_format: bool = True) -> str:
    """Formats months as "3 Yrs 8 Mos" (short) or "3 Years 8 Months" (long)."""
    if not months or months <= 0:
        return "0 Mos (Fresher)" if short_format else "0 Months (Fresher)"

    years = int(months // 12)
    remaining = js_round(months % 12)

    def yr(n: int) -> str:
        return ("Yr" if n == 1 else "Yrs") if short_format else ("Year" if n == 1 else "Years")

    def mo(n: int) -> str:
        return ("Mo" if n == 1 else "Mos") if short_format else ("Month" if n == 1 else "Months")

    if years == 0:
        return f"{remaining} {mo(remaining)}"
    if remaining == 0:
        return f"{years} {yr(years)}"
    return f"{years} {yr(years)} {remaining} {mo(remaining)}"


def calculate_months_diff(start: date, end: date) -> float:
    """Elapsed months between two dates, with fractional month for partial days."""
    if start > end:
        return 0

    months: float = (end.year - start.year) * 12 + (end.month - start.month)
    day_diff = end.day - start.day
    if day_diff < 0:
        months -= 1
        prev_year, prev_month = (end.year, end.month - 1) if end.month > 1 else (end.year - 1, 12)
        prev_month_days = days_in_month(prev_year, prev_month)
        months += max(0, (prev_month_days + day_diff) / prev_month_days)
    elif day_diff > 0:
        months += min(1, day_diff / days_in_month(end.year, end.month))

    return max(0, js_round(months * 10) / 10)


_MONTH_NAMES_MAP: dict[str, int] = {
    "jan": 0, "january": 0, "feb": 1, "february": 1, "mar": 2, "march": 2, "apr": 3, "april": 3,
    "may": 4, "jun": 5, "june": 5, "jul": 6, "july": 6, "aug": 7, "august": 7,
    "sep": 8, "sept": 8, "september": 8, "oct": 9, "october": 9, "nov": 10, "november": 10,
    "dec": 11, "december": 11,
}

_RANGE_SEP = r"(?:to|-|till|–|—)"


def _month_index(raw: str) -> int:
    raw = raw.lower()
    if raw in _MONTH_NAMES_MAP:
        return _MONTH_NAMES_MAP[raw]
    try:
        return max(0, min(11, int(raw) - 1))
    except ValueError:
        return 0


def parse_experience_period_to_months(text: Optional[str]) -> float:
    """Parses date ranges or durations ("01/04/2019 to 30/11/2022", "2 Years 6 Months") into months."""
    if not text:
        return 0
    clean = text.strip()
    if not clean or _EMPTY_MARKERS.match(clean):
        return 0

    # 1. DD/MM/YYYY to DD/MM/YYYY
    m = re.search(
        r"(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4})\s*(?:to|-|till|–|—|/)\s*(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4})",
        clean,
        re.IGNORECASE,
    )
    if m:
        d1, d2 = parse_date(m.group(1)), parse_date(m.group(2))
        if d1 and d2:
            months = calculate_months_diff(d1, d2)
            if months > 0:
                return months

    # 2. Month Year range: "April 2019 to Nov 2022" or "04/2019 to 11/2022"
    m = re.search(
        rf"([a-zA-Z]{{3,9}}|\d{{1,2}})[/\-.\s]+(\d{{4}})\s*{_RANGE_SEP}\s*([a-zA-Z]{{3,9}}|\d{{1,2}})[/\-.\s]+(\d{{4}})",
        clean,
        re.IGNORECASE,
    )
    if m:
        y1, y2 = int(m.group(2)), int(m.group(4))
        if 1 <= y1 <= 9999 and 1 <= y2 <= 9999:
            d1 = date(y1, _month_index(m.group(1)) + 1, 1)
            d2 = date(y2, _month_index(m.group(3)) + 1, 28)
            months = calculate_months_diff(d1, d2)
            if months > 0:
                return months

    # 3. Year to Year: "2019 to 2022"
    m = re.search(rf"\b(19\d\d|20\d\d)\s*{_RANGE_SEP}\s*(19\d\d|20\d\d)\b", clean)
    if m:
        y1, y2 = int(m.group(1)), int(m.group(2))
        if y2 >= y1:
            return (y2 - y1) * 12

    # 4. "X years Y months"
    m = re.search(
        r"(\d+(?:\.\d+)?)\s*(?:years?|yrs?|yr)\s*(?:and\s*)?(?:(\d+(?:\.\d+)?)\s*(?:months?|mos?|mo))?",
        clean,
        re.IGNORECASE,
    )
    if m:
        yrs = float(m.group(1) or 0)
        mos = float(m.group(2)) if m.group(2) else 0
        return js_round((yrs * 12 + mos) * 10) / 10

    # 5. "X months" only (ignore salary like "/mo")
    m = re.search(r"(?:^|[^/\w])(\d+(?:\.\d+)?)\s*(?:months?|mos?|mo)\b", clean, re.IGNORECASE)
    if m and not re.search(r"/\s*mo|per\s*month|ctc|salary|pm\b", clean, re.IGNORECASE):
        return float(m.group(1))

    return 0


def _present_employment_start(record: dict[str, Any]) -> tuple[Optional[date], str]:
    join_dt = record.get("JOIN_DT")
    if join_dt and join_dt != "-":
        parsed = parse_date(join_dt)
        if parsed:
            return parsed, join_dt

    present = record.get("PresentEmployment")
    if present and present != "-":
        m = re.search(r"(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4})", str(present))
        if m:
            parsed = parse_date(m.group(1))
            if parsed:
                return parsed, m.group(1)

    return None, "-"


def _previous_experience_months(record: dict[str, Any]) -> tuple[float, bool]:
    ext = record.get("extendedDetails") or {}
    prev_list = (ext.get("previousEmployments") or []) if isinstance(ext, dict) else []
    total = 0.0

    for job in prev_list:
        if not isinstance(job, dict):
            continue
        months = 0.0
        from_dt, to_dt = job.get("fromDate"), job.get("toDate")
        if from_dt and to_dt and from_dt != "-" and to_dt != "-":
            d1, d2 = parse_date(from_dt), parse_date(to_dt)
            if d1 and d2:
                months = calculate_months_diff(d1, d2)
        if months == 0:
            duration = job.get("duration") or (f"{from_dt} to {to_dt}" if from_dt and to_dt else "")
            months = parse_experience_period_to_months(duration)
        total += months

    previous_text = record.get("PreviousEmployment")
    if total == 0 and previous_text and previous_text != "-":
        raw = str(previous_text)
        parts = [
            s.strip()
            for s in re.split(r"(?:\r?\n|•|;)+", raw)
            if len(s.strip()) > 2 and not _EMPTY_MARKERS.match(s.strip())
        ]
        if parts:
            total += sum(parse_experience_period_to_months(p) for p in parts)
        else:
            total = parse_experience_period_to_months(raw)

    previous_exp = record.get("PreviousExperience")
    if total == 0 and previous_exp and previous_exp != "-" and "fresher" not in str(previous_exp).lower():
        total = parse_experience_period_to_months(str(previous_exp))

    is_fresher = total == 0 and (
        not previous_text or re.match(r"^(fresher|none|na|n/a|-|nil)$", str(previous_text).strip(), re.IGNORECASE)
        is not None
    )
    return js_round(total * 10) / 10, is_fresher


def calculate_employee_total_experience(record: dict[str, Any], as_of: Optional[date] = None) -> dict[str, Any]:
    """Calculates previous + current + total experience for an employee record."""
    as_of = as_of or date.today()

    previous_months, is_fresher = _previous_experience_months(record)

    start, start_raw = _present_employment_start(record)
    if start:
        current_months = calculate_months_diff(start, as_of)
        current_text = format_months_to_experience(current_months, True)
    else:
        current_months, current_text, start_raw = 0, "-", "-"

    total_months = js_round((previous_months + current_months) * 10) / 10

    return {
        "previousExperienceMonths": previous_months,
        "previousExperienceText": format_months_to_experience(previous_months, True),
        "currentExperienceMonths": current_months,
        "currentExperienceText": current_text,
        "totalExperienceMonths": total_months,
        "totalExperienceText": format_months_to_experience(total_months, True),
        "totalYearsDecimal": js_round((total_months / 12) * 10) / 10,
        "currentJobStartDate": start_raw,
        "isFresher": is_fresher,
    }
