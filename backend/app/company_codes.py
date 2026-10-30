"""KF Bioplants / Futura master code tables, code lookup, and probation/confirmation date rules.

Python port of frontend/src/companyCodes.ts. Keep both in sync when codes or rules change.
"""

from __future__ import annotations

import calendar
import re
import unicodedata
from datetime import date, datetime
from typing import Optional

CodeMap = dict[str, str]

# ==========================================
# 1. KF BIOPLANTS MASTER CODES
# ==========================================

KF_DESIGNATION_CODES: CodeMap = {
    "AC Technician": "01",
    "Accountant": "02",
    "Area Manager": "03",
    "Assistant": "04",
    "Asst. Executive": "05",
    "Asst. Manager": "06",
    "Asst. Manager HR & Admin": "07",
    "Asst. Supervisor": "08",
    "Asst. Tech. Manager": "09",
    "Asst. Vice President": "10",
    "Casual": "11",
    "Cleaner": "12",
    "Computer Operator": "13",
    "Crop Manager": "14",
    "Driver": "15",
    "Dy. General Manager": "16",
    "Electrician": "17",
    "Exe. Secretary": "18",
    "Executive": "19",
    "Field Assistant": "20",
    "Finance Manager": "21",
    "General Manager": "22",
    "General Manager Marketing": "23",
    "GH-Manager": "24",
    "Jr.Manager": "25",
    "Manager": "26",
    "Marketing Cum Technical Execue": "27",
    "Office Boy": "28",
    "Operator": "29",
    "Plumber": "30",
    "Product Manager": "31",
    "Receptionist": "32",
    "Regional Manager": "33",
    "Sales Coordinator": "34",
    "Security": "35",
    "Sr. Executive": "36",
    "Sr. Manager": "37",
    "Sr. Marketing Cum Tech. Execue": "38",
    "Sr. Supervisor": "39",
    "Sr.Technical Executive": "40",
    "Supervisor": "41",
    "Trainee": "42",
    "Trainee Asst. Executive": "43",
    "Trainee Asst. Supervisor": "44",
    "Trainee Comp. Operator": "45",
    "Trainee Driver": "46",
    "Trainee Field Assistant": "47",
    "Trainee Instrument Engineer": "48",
    "Trainee Makt.cum Tech. execute": "49",
    "Trainee Marketing Executive": "50",
    "Trainee Office Boy": "51",
    "Trainee Supervisor": "52",
    "Vice President": "53",
    "Zonal Manager": "54",
    "HK-Officer": "55",
    "Instrumentation Engineer": "56",
    "Trainee Executive": "57",
    "Sr. General Manager": "58",
    "President": "59",
    "Trainee Sales Co-ordinator": "60",
    "Co-ordinator": "61",
    "Sr.Marketing Executive": "62",
    "Apprentice": "63",
    "Director": "64",
    "Breeder": "65",
    "Jr.Breeder": "66",
    "Secretary": "67",
    "Sr.Sales & Marketing Executive": "68",
    "Dy.Green House Manager": "69",
    "Technical Manager": "70",
    "Trainee Store Assistant": "71",
    "Executive Assistant": "72",
    "Sr.Executive Business Develop.": "73",
    "Sales Officer": "74",
    "Market Development Officer": "75",
    "Trainee Research Associate": "76",
    "Research Associate": "77",
    "Sr.Accountant": "78",
    "Sr.Sales Co-ordinator": "79",
    "Deputy Manager": "80",
}

KF_DEPARTMENT_CODES: CodeMap = {
    "Accounts": "01",
    "Admin": "02",
    "Admin HSK": "03",
    "BW": "04",
    "Calla GH": "05",
    "Cap-Wash": "06",
    "CN-GH": "07",
    "Contamination": "08",
    "Demo-GH": "09",
    "Initiation": "10",
    "Dispatch": "11",
    "Dress Wash": "12",
    "Embryo": "13",
    "Exim": "14",
    "Garden": "15",
    "GE-GH": "16",
    "GH-Organic Farming": "17",
    "GH -Plug Machine": "18",
    "GH/Mun-GH": "19",
    "GH-HSK": "20",
    "Green House": "21",
    "Gypso GH": "22",
    "House-keeping": "23",
    "HR & Admin": "24",
    "Hypol-Machine": "25",
    "IT": "26",
    "KF-BW": "27",
    "Lab-HSK": "28",
    "LAB-Sealing": "29",
    "Limonium GH": "30",
    "Maintenance": "31",
    "Marketing": "32",
    "MPR": "33",
    "MSR": "34",
    "Operations": "35",
    "PGR": "36",
    "PIR": "37",
    "Pots-GH": "38",
    "Production": "39",
    "R & D": "40",
    "Rose-GH": "41",
    "Security": "42",
    "Seed-GH": "43",
    "ST-GH": "44",
    "Stores": "45",
    "Pot Marketing": "46",
    "Veg.Seed / Seedlings": "47",
    "Pre-Dispatch & Quality": "48",
    "Caper-GH": "49",
    "Dendrobium": "50",
    "DH-PIR": "51",
    "PURCHASE": "52",
    "Media Dispensary Room": "53",
}

KF_SECTION_CODES: CodeMap = {
    "Lab 02": "01",
    "Lab 01": "03",
    "Staff": "05",
    "Support Staff": "06",
    "Lab 03": "08",
}

# ==========================================
# 2. FUTURA MASTER CODES
# ==========================================

FUTURA_DESIGNATION_CODES: CodeMap = {
    "Sr.Executive": "01",
    "Sr. Supervisor": "02",
    "Asst. Executive": "03",
    "Asst. Supervisor": "04",
    "Sr.Lab Manager": "05",
    "Executive": "06",
    "Supervisor": "07",
    "Operator": "08",
    "Trainee": "09",
    "Casual": "10",
    "Computer Operator": "11",
    "Apprentice": "12",
    "Director": "13",
    "Electrician": "14",
    "System Administrator": "15",
    "Assistant": "16",
    "Assistant Manager": "17",
    "Security": "18",
    "Company Secretary": "19",
    "Driver": "20",
    "Jr.Manager": "21",
    "HK-Officer": "22",
    "Sr. Manager": "23",
    "General Manager": "24",
    "Instrumentation Engineer": "25",
    "Manager": "26",
    "Security Officer": "27",
    "Associate": "28",
    "Plumber": "29",
    "Deputy General Manager": "30",
    "Coordinator": "31",
}

FUTURA_DEPARTMENT_CODES: CodeMap = {
    "MPR": "01",
    "PIR": "02",
    "PGR": "03",
    "LAB-HSK": "04",
    "Contamination": "05",
    "Dispatch": "06",
    "Production": "07",
    "HSK": "08",
    "MSR": "09",
    "MDR": "10",
    "BW": "11",
    "Quality": "12",
    "Operations": "13",
    "Admin": "14",
    "Maintenance": "15",
    "IT": "16",
    "Purchase": "17",
    "Store": "18",
    "Exim": "19",
    "Security": "20",
    "HR": "21",
    "Accounts": "22",
    "Dress Wash": "23",
    "R&D": "24",
    "Green House": "25",
}

FUTURA_SECTION_CODES: CodeMap = {
    "Lab 01": "01",
    "Lab 02": "02",
    "Staff": "04",
    "Lab 03": "05",
}


def normalize(value: Optional[str]) -> str:
    text = unicodedata.normalize("NFKD", str(value if value is not None else "").lower())
    text = re.sub(r"[̀-ͯ]", "", text)
    text = text.replace("&", " and ")
    text = re.sub(r"[.\-_/]+", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def _has(pattern: str, text: str) -> bool:
    return re.search(pattern, text, re.IGNORECASE) is not None


def detect_company(value: Optional[str] = None, file_name: Optional[str] = None) -> str:
    text = f"{value or ''} {file_name or ''}".lower()
    if "futura" in text:
        return "FUTURA"
    if re.search(r"kf\s*bioplants?|kfbioplants?|kf\s*bio", text):
        return "KF"
    return ""


def get_code(code_map: CodeMap, value: Optional[str] = None) -> str:
    key = normalize(value)
    if not key:
        return "-"

    for name, code in code_map.items():
        if normalize(name) == key:
            return code

    # Partial / substring matching for flexible OCR extraction
    for name, code in code_map.items():
        norm_name = normalize(name)
        if norm_name in key or key in norm_name:
            return code

    return "-"


def get_futura_designation_code(designation: Optional[str] = None) -> str:
    norm = normalize(designation)
    if not norm:
        return "-"

    direct = get_code(FUTURA_DESIGNATION_CODES, designation)
    if direct != "-":
        return direct

    # Futura specific aliases
    rules: list[tuple[str, str]] = [
        (r"sr\s*lab\s*manager|senior\s*lab\s*manager", "05"),
        (r"sys\s*admin|system\s*admin|system\s*administrator", "15"),
        (r"asst\s*manager|assistant\s*manager", "17"),
        (r"company\s*sec|company\s*secretary", "19"),
        (r"jr\s*manager|junior\s*manager", "21"),
        (r"hk\s*officer|housekeeping\s*officer|house\s*keeping\s*officer", "22"),
        (r"sr\s*manager|senior\s*manager", "23"),
        (r"gen\s*manager|general\s*manager|\bgm\b", "24"),
        (r"instrument|instrumentation\s*engineer", "25"),
        (r"sec\s*officer|security\s*officer", "27"),
        (r"dy\s*gen|deputy\s*gen|deputy\s*general\s*manager|\bdgm\b", "30"),
        (r"coord|co-ordinator|coordinator|sales\s*coord", "31"),
        (r"asst\s*exec|assistant\s*exec|trainee\s*asst\s*exec", "03"),
        (r"asst\s*sup|assistant\s*sup|trainee\s*asst\s*sup", "04"),
        (r"sr\s*exec|senior\s*exec", "01"),
        (r"sr\s*sup|senior\s*sup", "02"),
        (r"comp\s*op|computer\s*operator", "11"),
        (r"apprentice", "12"),
        (r"director", "13"),
        (r"electrician|electric", "14"),
    ]
    for pattern, code in rules:
        if _has(pattern, norm):
            return code

    if _has(r"assistant|asst\b", norm) and not _has(r"manager|executive|supervisor", norm):
        return "16"
    if _has(r"security\b", norm) and not _has(r"officer", norm):
        return "18"
    if _has(r"driver", norm):
        return "20"
    if _has(r"manager\b", norm) and not _has(r"asst|sr|gen|dy|jr|lab", norm):
        return "26"

    tail_rules: list[tuple[str, str]] = [
        (r"associate|research\s*associate", "28"),
        (r"plumber", "29"),
        (r"casual", "10"),
        (r"operator", "08"),
        (r"supervisor|sup\b", "07"),
        (r"executive|exec\b", "06"),
        (r"trainee", "09"),
    ]
    for pattern, code in tail_rules:
        if _has(pattern, norm):
            return code

    return "-"


def get_kf_designation_code(designation: Optional[str] = None) -> str:
    norm = normalize(designation)
    if not norm:
        return "-"

    direct = get_code(KF_DESIGNATION_CODES, designation)
    if direct != "-":
        return direct

    # Specific common variations & abbreviations for KF
    if _has(r"asst\s*manager\s*hr|assistant\s*manager\s*hr|hr\s*and\s*admin\s*asst\s*manager", norm):
        return "07"
    if _has(r"asst\s*tech\s*manager|assistant\s*technical\s*manager", norm):
        return "09"
    if _has(r"asst\s*vice\s*president|assistant\s*vp|avp", norm):
        return "10"
    if _has(r"dy\s*general\s*manager|deputy\s*general\s*manager|dgm", norm):
        return "16"
    if _has(r"general\s*manager\s*marketing|gm\s*marketing", norm):
        return "23"
    if _has(r"gh\s*manager|green\s*house\s*manager", norm):
        return "24"
    if _has(r"jr\s*manager|junior\s*manager", norm):
        return "25"
    if _has(r"marketing\s*cum\s*tech", norm) and _has(r"sr", norm):
        return "38"
    if _has(r"trainee\s*makt\s*cum|trainee\s*marketing\s*cum\s*tech", norm):
        return "49"

    rules: list[tuple[str, str]] = [
        (r"marketing\s*cum\s*tech", "27"),
        (r"sr\s*tech\s*exec|senior\s*technical\s*executive", "40"),
        (r"trainee\s*asst\s*exec|trainee\s*assistant\s*executive", "43"),
        (r"trainee\s*asst\s*sup|trainee\s*assistant\s*supervisor", "44"),
        (r"trainee\s*comp\s*op|trainee\s*computer\s*operator", "45"),
        (r"trainee\s*driver", "46"),
        (r"trainee\s*field\s*asst|trainee\s*field\s*assistant", "47"),
        (r"trainee\s*instrument\s*eng", "48"),
        (r"trainee\s*marketing\s*exec", "50"),
        (r"trainee\s*office\s*boy", "51"),
        (r"trainee\s*supervisor", "52"),
        (r"trainee\s*executive", "57"),
        (r"trainee\s*sales\s*coord", "60"),
        (r"trainee\s*store\s*asst|trainee\s*store\s*assistant|store\s*assistant", "71"),
        (r"trainee\s*research\s*assoc", "76"),
        (r"research\s*associate", "77"),
        (r"hk\s*officer|housekeeping\s*officer", "55"),
        (r"instrumentation\s*engineer|instrument\s*engineer", "56"),
        (r"sr\s*general\s*manager|senior\s*general\s*manager", "58"),
        (r"sr\s*marketing\s*exec", "62"),
        (r"jr\s*breeder", "66"),
        (r"breeder", "65"),
        (r"sr\s*sales\s*and\s*marketing|sr\s*sales\s*marketing", "68"),
        (r"dy\s*green\s*house\s*manager|deputy\s*gh\s*manager", "69"),
        (r"technical\s*manager", "70"),
        (r"sr\s*exec\s*business\s*dev|business\s*development", "73"),
        (r"market\s*development\s*officer|mdo", "75"),
        (r"sr\s*accountant", "78"),
        (r"sr\s*sales\s*coord", "79"),
        (r"deputy\s*manager|dy\s*manager", "80"),
        (r"asst\s*manager|assistant\s*manager", "06"),
        (r"asst\s*exec|assistant\s*executive", "05"),
        (r"asst\s*sup|assistant\s*supervisor", "08"),
        (r"sr\s*exec|senior\s*executive", "36"),
        (r"sr\s*manager|senior\s*manager", "37"),
        (r"sr\s*sup|senior\s*supervisor", "39"),
    ]
    for pattern, code in rules:
        if _has(pattern, norm):
            return code

    return "-"


def get_designation_code(company: str, designation: Optional[str] = None) -> str:
    if company == "FUTURA":
        return get_futura_designation_code(designation)
    kf_code = get_kf_designation_code(designation)
    if kf_code != "-":
        return kf_code
    if not company:
        return get_futura_designation_code(designation)
    return "-"


def get_futura_department_code(department: Optional[str] = None) -> str:
    norm = normalize(department)
    if not norm:
        return "-"

    direct = get_code(FUTURA_DEPARTMENT_CODES, department)
    if direct != "-":
        return direct

    if _has(r"mpr", norm):
        return "01"
    if _has(r"pir|dh\s*pir", norm):
        return "02"
    if _has(r"pgr", norm):
        return "03"
    if _has(r"lab\s*hsk", norm):
        return "04"
    if _has(r"contam|contamination", norm):
        return "05"
    if _has(r"dispatch|pre\s*dispatch", norm):
        return "06"
    if _has(r"production|prod", norm):
        return "07"
    if _has(r"hsk|house\s*keeping|housekeeping", norm):
        return "08"
    if _has(r"msr", norm):
        return "09"
    if _has(r"mdr|media\s*disp|media\s*dispensary", norm):
        return "10"
    if _has(r"bw|bottle\s*wash|kf\s*bw", norm):
        return "11"
    if _has(r"quality|qa|qc", norm):
        return "12"
    if _has(r"operation|operations|ops", norm):
        return "13"
    if _has(r"admin\s*hsk", norm):
        return "14"
    if _has(r"admin", norm) and not _has(r"hr", norm):
        return "14"
    if _has(r"maint|maintenance", norm):
        return "15"
    if _has(r"\bit\b|infotech|information\s*tech", norm):
        return "16"
    if _has(r"purchase", norm):
        return "17"
    if _has(r"store|stores", norm):
        return "18"
    if _has(r"exim|export", norm):
        return "19"
    if _has(r"sec|security", norm):
        return "20"
    if _has(r"hr|human\s*res|hr\s*and\s*admin|hr\s*admin", norm):
        return "21"
    if _has(r"acc|account|accounts|finance", norm):
        return "22"
    if _has(r"dress\s*wash|cap\s*wash", norm):
        return "23"
    if _has(r"r\s*and\s*d|rnd|r&d|research", norm):
        return "24"
    if _has(
        r"green\s*house|greenhouse|\bgh\b|calla|demo|gypso|rose|seed|pots|st|caper|dendrobium|organic|plug",
        norm,
    ):
        return "25"

    return "-"


def get_kf_department_code(department: Optional[str] = None) -> str:
    norm = normalize(department)
    if not norm:
        return "-"

    direct = get_code(KF_DEPARTMENT_CODES, department)
    if direct != "-":
        return direct

    # Specific common department abbreviations & synonyms for KF
    rules: list[tuple[str, str]] = [
        (r"admin\s*hsk", "03"),
        (r"hr\s*and\s*admin|hr\s*admin|human\s*res", "24"),
        (r"accounts|acc|finance", "01"),
        (r"admin", "02"),
        (r"calla", "05"),
        (r"cap\s*wash", "06"),
        (r"cn\s*gh", "07"),
        (r"contamination|contam", "08"),
        (r"demo\s*gh", "09"),
        (r"initiation", "10"),
        (r"dispatch", "11"),
        (r"dress\s*wash", "12"),
        (r"embryo", "13"),
        (r"exim|export", "14"),
        (r"garden", "15"),
        (r"ge\s*gh", "16"),
        (r"organic\s*farm", "17"),
        (r"plug\s*machine", "18"),
        (r"mun\s*gh|gh\s*mun", "19"),
        (r"gh\s*hsk", "20"),
        (r"gyp\s*gh|gypso", "22"),
        (r"house\s*keeping|hsk", "23"),
        (r"hypol", "25"),
        (r"\bit\b|information\s*tech", "26"),
        (r"kf\s*bw", "27"),
        (r"lab\s*hsk", "28"),
        (r"lab\s*sealing|sealing", "29"),
        (r"limon|limonium", "30"),
        (r"maintenance|maint", "31"),
        (r"marketing", "32"),
        (r"mpr", "33"),
        (r"msr", "34"),
        (r"operations|ops", "35"),
        (r"pgr", "36"),
        (r"dh\s*pir", "51"),
        (r"pir", "37"),
        (r"pots\s*gh", "38"),
        (r"production|prod", "39"),
        (r"r\s*and\s*d|rnd|research", "40"),
        (r"rose\s*gh", "41"),
        (r"security", "42"),
        (r"seed\s*gh", "43"),
        (r"st\s*gh", "44"),
        (r"stores|store", "45"),
        (r"pot\s*marketing", "46"),
        (r"seedling|veg\s*seed", "47"),
        (r"pre\s*dispatch|quality", "48"),
        (r"caper", "49"),
        (r"dendrobium", "50"),
        (r"purchase", "52"),
        (r"media\s*disp|mdr", "53"),
        (r"green\s*house|gh", "21"),
        (r"bw", "04"),
    ]
    for pattern, code in rules:
        if _has(pattern, norm):
            return code

    return "-"


def get_department_code(company: str, department: Optional[str] = None) -> str:
    if company == "FUTURA":
        return get_futura_department_code(department)
    kf_code = get_kf_department_code(department)
    if kf_code != "-":
        return kf_code
    if not company:
        return get_futura_department_code(department)
    return "-"


def get_futura_section_code(section: Optional[str] = None) -> str:
    norm = normalize(section)
    if not norm:
        return "-"

    if _has(r"lab\s*0?1\b|lab1\b", norm):
        return "01"
    if _has(r"lab\s*0?2\b|lab2\b", norm):
        return "02"
    if _has(r"support\s*staff|staff", norm):
        return "04"
    if _has(r"lab\s*0?3\b|lab3\b", norm):
        return "05"
    return get_code(FUTURA_SECTION_CODES, section)


def get_kf_section_code(section: Optional[str] = None) -> str:
    norm = normalize(section)
    if not norm:
        return "-"

    if _has(r"lab\s*0?2\b|lab2\b", norm):
        return "01"
    if _has(r"lab\s*0?1\b|lab1\b", norm):
        return "03"
    if _has(r"support\s*staff", norm):
        return "06"
    if _has(r"staff", norm):
        return "05"
    if _has(r"lab\s*0?3\b|lab3\b", norm):
        return "08"
    return get_code(KF_SECTION_CODES, section)


def get_section_code(company: str, section: Optional[str] = None) -> str:
    if company == "FUTURA":
        return get_futura_section_code(section)
    kf_code = get_kf_section_code(section)
    if kf_code != "-":
        return kf_code
    if not company:
        return get_futura_section_code(section)
    return "-"


# ==========================================
# 3. PROBATION / CONFIRMATION RULES
# ==========================================

# (designation, probation months) from the master probation rules table
MASTER_PROBATION_RULES_TABLE: list[tuple[str, int]] = [
    ("Trainee", 12),
    ("Trainee Asst. Executive", 3),
    ("Trainee Asst. Supervisor", 6),
    ("Trainee Comp. Operator", 6),
    ("Trainee Driver", 6),
    ("Trainee Field Assistant", 6),
    ("Trainee Instrument Engineer", 3),
    ("Trainee Makt.cum Tech. execute", 3),
    ("Trainee Marketing Executive", 3),
    ("Trainee Office Boy", 6),
    ("Trainee Supervisor", 6),
    ("Trainee Executive", 3),
    ("Trainee Sales Co-ordinator", 6),
    ("Apprentice", 12),
    ("Trainee Store Assistant", 12),
    ("Trainee Research Associate", 3),
]


def _rule(canonical_name: str, months: int) -> dict:
    bucket = "1 Year" if months == 12 else f"{months} Months"
    return {
        "matched": True,
        "canonicalName": canonical_name,
        "probationMonths": months,
        "probationBucket": bucket,
        "probationRuleText": f"From Date of Joining {bucket}",
        "confirmationRuleText": "From Probation Date 6 months",
        "confirmationMonths": 6,
    }


def get_probation_rule_match(designation: Optional[str] = None) -> dict:
    """Matches any designation string to its rule bucket (3 Months, 6 Months, 1 Year)."""
    norm = normalize(designation)
    if not norm:
        return _rule("Standard Employee", 6)

    # 1. Exact normalized match from table
    for name, months in MASTER_PROBATION_RULES_TABLE:
        if norm == normalize(name):
            return _rule(name, months)

    # 2. Fuzzy matching for the 3 buckets (order matters)
    has = lambda p: _has(p, norm)  # noqa: E731

    # --- 1 YEAR BUCKET ---
    if has(r"store"):
        return _rule("Trainee Store Assistant", 12)
    if has(r"apprentice"):
        return _rule("Apprentice", 12)

    # --- 3 MONTHS BUCKET ---
    if (has(r"asst") or has(r"assistant")) and (has(r"exec") or has(r"executive")):
        return _rule("Trainee Asst. Executive", 3)
    if has(r"instrument") or has(r"instrumentation") or has(r"engineer"):
        return _rule("Trainee Instrument Engineer", 3)
    if (has(r"makt") or has(r"mkt") or has(r"marketing")) and (has(r"tech") or has(r"technical")):
        return _rule("Trainee Makt.cum Tech. execute", 3)
    if (has(r"marketing") or has(r"mkt") or has(r"market\s*dev")) and (
        has(r"exec") or has(r"executive") or has(r"officer")
    ):
        return _rule("Trainee Marketing Executive", 3)
    if has(r"research") or has(r"associate") or has(r"res"):
        return _rule("Trainee Research Associate", 3)
    if has(r"system\s*admin") or has(r"sys\s*admin") or has(r"\bit\b"):
        return _rule("System Administrator", 3)
    if has(r"officer") or has(r"secretary") or has(r"receptionist") or has(r"accountant"):
        return _rule("Executive Officer", 3)
    if has(r"executive") or has(r"exec"):
        return _rule("Trainee Executive", 3)

    # --- 6 MONTHS BUCKET ---
    if (has(r"asst") or has(r"assistant")) and (has(r"sup") or has(r"supervisor")):
        return _rule("Trainee Asst. Supervisor", 6)
    if has(r"comp") or has(r"computer") or has(r"op") or has(r"operator"):
        return _rule("Trainee Comp. Operator", 6)
    if has(r"driver"):
        return _rule("Trainee Driver", 6)
    if has(r"field") or has(r"lab\s*asst") or has(r"assistant") or has(r"asst"):
        return _rule("Trainee Field Assistant", 6)
    if has(r"office\s*boy") or has(r"officeboy") or has(r"peon") or has(r"cleaner") or has(r"casual"):
        return _rule("Trainee Office Boy", 6)
    if has(r"sales") or has(r"coord") or has(r"co\s*ordinator"):
        return _rule("Trainee Sales Co-ordinator", 6)
    if has(r"supervisor") or has(r"sup"):
        return _rule("Trainee Supervisor", 6)
    if has(r"agronom") or has(r"crop") or has(r"breed"):
        return _rule("Trainee Agronomist", 6)
    if has(r"tech") or has(r"electric") or has(r"plumb"):
        return _rule("Trainee Technician", 6)

    # General Trainee role (1 Year if pure trainee)
    if has(r"trainee"):
        return _rule("Trainee", 12)

    # General Employee fallback (6 Months standard probation)
    return _rule(designation or "Standard Employee", 6)


def get_probation_months(designation: Optional[str] = None) -> int:
    return get_probation_rule_match(designation)["probationMonths"]


# ==========================================
# 4. DATE HELPERS
# ==========================================

_MONTHS_MAP: dict[str, int] = {
    "jan": 1, "january": 1, "feb": 2, "february": 2, "mar": 3, "march": 3, "apr": 4, "april": 4,
    "may": 5, "jun": 6, "june": 6, "jul": 7, "july": 7, "aug": 8, "august": 8,
    "sep": 9, "sept": 9, "september": 9, "oct": 10, "october": 10, "nov": 11, "november": 11,
    "dec": 12, "december": 12,
}


def days_in_month(year: int, month: int) -> int:
    return calendar.monthrange(year, month)[1]


def _clamped_date(year: int, month: int, day: int) -> Optional[date]:
    if not (1 <= day <= 31 and 1 <= month <= 12 and 1 <= year <= 9999):
        return None
    return date(year, month, min(max(1, day), days_in_month(year, month)))


def parse_date(value: Optional[str] = None) -> Optional[date]:
    if not value:
        return None
    raw = str(value).strip()
    if raw in ("-", "") or raw.lower() in ("null", "undefined", "none"):
        return None

    # Clean extraneous whitespace around slashes/hyphens/dots
    clean = re.sub(r"\s*([/\-.])\s*", r"\1", raw).strip()

    # DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
    m = re.fullmatch(r"(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})", clean)
    if m:
        parsed = _clamped_date(int(m.group(3)), int(m.group(2)), int(m.group(1)))
        if parsed:
            return parsed

    # DD/MM/YY (2-digit year)
    m = re.fullmatch(r"(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2})", clean)
    if m:
        year = int(m.group(3))
        year += 2000 if year < 50 else 1900
        parsed = _clamped_date(year, int(m.group(2)), int(m.group(1)))
        if parsed:
            return parsed

    # YYYY-MM-DD (ISO)
    m = re.fullmatch(r"(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})", clean)
    if m:
        parsed = _clamped_date(int(m.group(1)), int(m.group(2)), int(m.group(3)))
        if parsed:
            return parsed

    # Textual dates e.g. "28 Sep 2024", "28-Sep-2024"
    m = re.fullmatch(r"(\d{1,2})[\s\-]+([a-zA-Z]+)[\s\-]+(\d{4})", clean)
    if m and m.group(2).lower() in _MONTHS_MAP:
        parsed = _clamped_date(int(m.group(3)), _MONTHS_MAP[m.group(2).lower()], int(m.group(1)))
        if parsed:
            return parsed

    # Other common textual forms: "Sep 28, 2024", "September 2024", "2024"
    m = re.fullmatch(r"([a-zA-Z]+)[\s\-]+(\d{1,2}),?[\s\-]+(\d{4})", clean)
    if m and m.group(1).lower() in _MONTHS_MAP:
        return _clamped_date(int(m.group(3)), _MONTHS_MAP[m.group(1).lower()], int(m.group(2)))
    m = re.fullmatch(r"([a-zA-Z]+)[\s\-]+(\d{4})", clean)
    if m and m.group(1).lower() in _MONTHS_MAP:
        return _clamped_date(int(m.group(2)), _MONTHS_MAP[m.group(1).lower()], 1)
    if re.fullmatch(r"\d{4}", clean):
        return _clamped_date(int(clean), 1, 1)

    try:
        return datetime.fromisoformat(clean.replace("Z", "+00:00")).date()
    except ValueError:
        return None


def format_date(d: date) -> str:
    return f"{d.day:02d}/{d.month:02d}/{d.year}"


def add_months_to_date(value: Optional[str], months: int) -> str:
    d = parse_date(value)
    if not d:
        return "-"
    total = d.year * 12 + (d.month - 1) + months
    year, month = divmod(total, 12)
    month += 1
    if not 1 <= year <= 9999:
        return "-"
    return format_date(date(year, month, min(d.day, days_in_month(year, month))))


def calculate_probation_date(join_date: Optional[str] = None, designation: Optional[str] = None) -> str:
    if not join_date or join_date == "-" or not join_date.strip():
        return "-"
    return add_months_to_date(join_date, get_probation_months(designation))


def calculate_confirmation_date(probation_date: Optional[str] = None) -> str:
    if not probation_date or probation_date == "-" or not probation_date.strip():
        return "-"
    return add_months_to_date(probation_date, 6)


# ==========================================
# 5. RECORD ENRICHMENT
# ==========================================


def enrich_employee_record(
    company: str = "",
    lab_details: str = "",
    desig: str = "",
    join_dt: str = "",
    dept_name: str = "",
) -> dict:
    company = company or detect_company(lab_details)
    desig_code = get_kf_designation_code(desig)
    f_desig_code = get_futura_designation_code(desig)
    dept_code = get_kf_department_code(dept_name)
    f_dept_code = get_futura_department_code(dept_name)
    sec_code = get_kf_section_code(lab_details or "")
    f_sec_code = get_futura_section_code(lab_details or "")

    if company == "KF":
        f_desig_code = f_dept_code = f_sec_code = ""
    elif company == "FUTURA":
        desig_code = dept_code = sec_code = ""

    probation = calculate_probation_date(join_dt, desig)
    confirmation = calculate_confirmation_date(probation) if probation != "-" else "-"

    needs_review = (
        (bool(desig) and desig_code == "-" and f_desig_code == "-")
        or (bool(dept_name) and dept_code == "-" and f_dept_code == "-")
        or (bool(join_dt) and probation == "-")
    )

    return {
        "COMPANY": company,
        "DESIG_CODE": desig_code,
        "F_DESIG_CODE": f_desig_code,
        "DEPT_CODE": dept_code,
        "F_DEPT_CODE": f_dept_code,
        "SECTION_CODE": sec_code,
        "F_SECTION_CODE": f_sec_code,
        "PRB_DT": probation,
        "CONF_DT": confirmation,
        "codeMappingStatus": "REVIEW_REQUIRED" if needs_review else "MAPPED",
    }
