"""AI extraction of employee records from scanned forms, and normalization into the master record format."""

from __future__ import annotations

import logging
import random
import re
import string
import time
from datetime import datetime, timezone
from typing import Any, Optional

from google import genai
from google.genai import types

from .company_codes import (
    calculate_confirmation_date,
    calculate_probation_date,
    detect_company,
    enrich_employee_record,
)
from .experience import calculate_employee_total_experience
from .gemini_client import (
    clean_and_repair_json,
    execute_gemini_with_fallback,
    is_account_error,
    is_not_found_error,
    is_retryable_error,
)
from .list_formatter import (
    apply_sorted_bulleted_formatting,
    format_previous_employments_list,
    format_qualifications_list,
)

logger = logging.getLogger("extraction")

DEFAULT_FILE_NAME = "Scanned_Employee_Form.pdf"


def _str(description: Optional[str] = None) -> dict:
    return {"type": "STRING", "description": description} if description else {"type": "STRING"}


def _array_of(properties: dict) -> dict:
    return {"type": "ARRAY", "items": {"type": "OBJECT", "properties": properties}}


EMPLOYEE_RECORD_JSON_SCHEMA: dict = {
    "type": "OBJECT",
    "properties": {
        "confidenceScore": {"type": "NUMBER"},
        "COMPANY_SOURCE": _str("Where the company was found for THIS candidate: WRITTEN, LOGO, or NONE"),
        "COMPANY_EVIDENCE": _str("Exact text quoted from this candidate's pages that names the company, and which field it is in"),
        "COMPANY": _str("KF, FUTURA, or empty if both or neither appear (form text first, then header logo)"),
        "DESIG_CODE": _str(),
        "DEPT_CODE": _str(),
        "SECTION_CODE": _str(),
        "PRB_DT": _str(),
        "CONF_DT": _str(),
        "NAME": _str("Full employee name in standard case"),
        "BIRTH_DT": _str("DOB in DD/MM/YYYY format"),
        "Gender": _str("Male or Female"),
        "MaritalStatus": _str("Single, Married, Unmarried, Divorced"),
        "DESIG": _str("Designation / Position applied for"),
        "JOIN_DT": _str("Date of Joining in DD/MM/YYYY format"),
        "DEPT_NAME": _str("Department Name"),
        "LabDetails": _str("Lab 01, Lab 02, Lab 03, Staff, Support Staff, etc."),
        "EPAN_NO": _str("10-character PAN number e.g. ABCDE1234F"),
        "EMAILID": _str("Email ID"),
        "Address1": _str("Permanent / Native Address"),
        "Address2": _str("Present / Mailing Address"),
        "Pin1": _str("Permanent Pincode (6 digits)"),
        "Pin2": _str("Present Pincode (6 digits)"),
        "ADHAR_NO": _str("12-digit Aadhaar Number"),
        "PF_UAN": _str("12-digit PF / UAN Number"),
        "ESI_Number": _str("ESI Number"),
        "EMP_MobileNumber": _str("10-digit primary mobile number"),
        "Alternate_MobileNumber": _str("Alternate contact / phone number"),
        "FatherName": _str("Father's Full Name"),
        "FatherDOB": _str("Father's DOB (DD/MM/YYYY)"),
        "MotherName": _str("Mother's Full Name"),
        "MotherDOB": _str("Mother's DOB (DD/MM/YYYY)"),
        "SpouseName": _str("Spouse's Full Name"),
        "SpouseDOB": _str("Spouse's DOB (DD/MM/YYYY)"),
        "Child1": _str("Child 1 Name"),
        "Child1DOB": _str("Child 1 DOB (DD/MM/YYYY)"),
        "Child2": _str("Child 2 Name"),
        "Child2DOB": _str("Child 2 DOB (DD/MM/YYYY)"),
        "Qualification": _str("Chronological education summary"),
        "PreviousEmployment": _str("Chronological previous employment summary"),
        "PresentEmployment": _str("Present employment company, post, joining date"),
        "ReferenceName": _str("References listed on form (Name, Designation, Company, Phone)"),
        "extendedDetails": {
            "type": "OBJECT",
            "properties": {
                **{
                    key: _str()
                    for key in (
                        "lastName", "firstName", "middleInitial", "placeOfBirth", "age", "nationality",
                        "religion", "category", "domicileState", "bloodGroup", "heightFt", "weightKg",
                        "identificationMarks", "majorAreaOfExperience", "organizationChart",
                        "ctcGrossPerAnnum", "expectedSalary", "joiningAvailability",
                    )
                },
                "academics": _array_of({
                    "level": _str("10th/SSC, 12th/HSC, Diploma, Graduation, Post Graduation, etc."),
                    "courseName": _str("Degree / Course name e.g. B.Sc Botany"),
                    "institute": _str("School / College / Institute name"),
                    "boardUniversity": _str("Board or University name e.g. CBSE, SPPU"),
                    "cityState": _str("City / State"),
                    "passYear": _str("Year of passing e.g. 2018"),
                    "percentageOrCgpa": _str("Percentage or CGPA e.g. 78%"),
                }),
                "familyMembers": _array_of({
                    "relationship": _str("Father, Mother, Spouse, Son, Daughter, Brother, Sister"),
                    "name": _str("Full Name"),
                    "dob": _str("DOB DD/MM/YYYY"),
                    "occupation": _str("Occupation / Job"),
                    "dependent": _str("Yes / No"),
                }),
                "previousEmployments": _array_of({
                    "organizationName": _str("Previous employer / company name"),
                    "duration": _str("Dates e.g. 01/04/2019 to 30/11/2022"),
                    "fromDate": _str("Start date DD/MM/YYYY or YYYY"),
                    "toDate": _str("End date DD/MM/YYYY or YYYY"),
                    "lastDesignation": _str("Designation / Position"),
                    "emoluments": _str("Salary as written, with period e.g. '15,000 / month'"),
                    "industry": _str("Industry / Sector"),
                    "reasonForLeaving": _str("Reason for leaving"),
                }),
                "languages": _array_of({
                    "language": _str(),
                    "read": {"type": "BOOLEAN"},
                    "write": {"type": "BOOLEAN"},
                    "speak": {"type": "BOOLEAN"},
                }),
            },
        },
    },
    "required": ["NAME"],
}
# The model writes fields in this order, so it states its company evidence before deciding COMPANY
EMPLOYEE_RECORD_JSON_SCHEMA["propertyOrdering"] = list(EMPLOYEE_RECORD_JSON_SCHEMA["properties"])

RESPONSE_SCHEMA: dict = {
    "type": "OBJECT",
    "properties": {
        "records": {
            "type": "ARRAY",
            "description": "List of extracted employee records from the document(s)",
            "items": EMPLOYEE_RECORD_JSON_SCHEMA,
        }
    },
}

SYSTEM_EXTRACTION_PROMPT = """You are an expert HR Document OCR & Intelligent Extraction Engine for KF Bioplants and Futura employee onboarding documents.
Read all supplied images/pages/PDF documents with maximum optical precision. Extract all visible handwritten and printed data into the structured schema.

--- MULTILINGUAL & MARATHI SUPPORT ---
- The documents and handwritten forms may contain English and Marathi (मराठी) text or Devanagari script.
- Accurately read handwritten Marathi names, addresses, relations (आई, वडील, पती, पत्नी, मुलगा, मुलगी), qualification degrees, and employment histories.
- Transliterate/standardize Marathi names and addresses into standard English/Roman script for the master database fields while retaining exact character fidelity.

--- MULTI-DOCUMENT & MULTI-PAGE INTELLIGENT MERGING RULES ---
1. Multi-Page Forms for the SAME candidate:
   Scanned employee forms frequently span 2 or more pages/images (e.g., Page 1 contains Personal Details, Date of Birth, Gender, Address, Contact Numbers, Family Details; Page 2 contains Academic Qualifications, Previous Employment History, Present Employment, Reference Names, Languages).
   * IF MULTIPLE UPLOADED PAGES / FILES BELONG TO THE SAME CANDIDATE:
     You MUST merge all data from all pages into ONE SINGLE complete employee record in the 'records' array. Ensure ZERO missing fields across Personal, Contact, Address, Family, Academic, Experience, and Reference sections.
2. Forms for MULTIPLE DIFFERENT candidates:
   * IF THE UPLOADED DOCUMENTS CONTAIN FORMS FOR DIFFERENT EMPLOYEES:
     Extract EACH candidate as an individual complete item in the 'records' array. Ensure all fields are thoroughly populated for every candidate.
   * Each "Checklist recruitment" sheet starts a new candidate; the application form / data form / offer letter that follows with the same name belongs to that candidate. Count the different candidate names first and return exactly one record per name. Never merge two candidates with different names.
   * Decide EVERY field (especially COMPANY, DESIG, JOIN_DT, DEPT_NAME, LabDetails) separately for each candidate, using ONLY that candidate's own pages. Never copy a value from one candidate to another.
3. Typical document set per candidate: a pink "L-Checklist recruitment" sheet (recruiter's handwritten notes), a Marathi application form, sometimes an English "PERSONAL DATA FORM", and sometimes a typed offer letter ("नोकरी हमी पत्र").
   * For name spelling, prefer the typed offer letter, then the clearest handwriting.

--- NEVER INVENT DATA ---
- Leave a field "" when it is not written for that candidate. Do not fill a field with a typical value, a value from another field, or a value from another candidate.
- The printed company letterhead (address "सर्व्हे नं. 129/123 सी, मांजरी (बुद्रुक) ... पुणे - 412 307", phone 020 26948400) is the COMPANY's address. Never use it, or its pincode 412307, for any candidate field. Use 412307 only if the candidate wrote it in their own address.

--- FIELD-BY-FIELD EXTRACTION SPECIFICATIONS ---
- COMPANY: Return "KF" (KF Bioplants), "FUTURA" (Futura), or "". Decide strictly in this order:
  1. WRITTEN ON THE FORM FIRST: Look at what is written for THIS candidate (outside the printed header/letterhead): the LAB field and the notes beside it, the DOJ / joining notes, the recruiter's notes on the checklist, stamps, and the typed offer letter's text (e.g. "Futura_2 (PIR)", "Lab-1 (PIR)" under a Futura logo, "करिता, फुचूरा बायोप्लान्टस").
     * Short forms count: "Futura-2", "Futura Lab-1", "F-2" -> Futura; "KF Disp", "kf-3", "KF Lab 1" -> KF.
     * If ONLY KF is written -> "KF". If ONLY Futura is written -> "FUTURA".
     * If BOTH KF and Futura are written for this candidate (and one is not crossed out) -> return "".
     * A crossed-out / struck-through value does not count (e.g. "KF Lab 2" struck out and "Futura-2" written beside it -> "FUTURA").
  2. LOGO / LETTERHEAD SECOND: Only if nothing is written, look at the printed logo or header of the form.
     * "KF Bioplants" logo (e.g. top-left of the English "PERSONAL DATA FORM") -> "KF". "Futura Bioplants" logo -> "FUTURA".
     * The Marathi form letterhead "के.एफ./फ्युच्युरा बायोप्लांटस प्रा. लि." means "KF / Futura Bioplants": it names BOTH companies, so on its own it gives "".
  3. Otherwise return "". Never guess the company from designation, department, or any other field.
  * Only KF Bioplants and Futura are valid. Any other company (e.g. "Kumar Bioseeds and Agro Products LLP") -> "".
  * IGNORE company/lab text that belongs to someone else: references ("Reference Name / Lab: Neha Sawant -> Futura-2 (31089)", "परिचयदात्याचे नाव: ... kf-3 (000091)"), and the candidate's previous / present employers. A reference's lab shows where the REFERENCE works, not the candidate.
  * Fill COMPANY_SOURCE ("WRITTEN", "LOGO" or "NONE") and COMPANY_EVIDENCE (quote the exact text and name its field, e.g. "LAB: Futura-2 (PIR)", "checklist top note: kf Disp.", "logo: KF Bioplants on PERSONAL DATA FORM"). If the only mention is in a reference, the letterhead, or an employer -> COMPANY_SOURCE "NONE", COMPANY "".
- NAME: Complete full name, always in the order "First Middle Surname" (e.g. "Pooja Ganesh Ubale"), even when the form writes the surname first (Marathi "आडनाव नाव वडिलांचे" = Surname First Middle). Clean up OCR noise.
- BIRTH_DT: Date of birth strictly formatted as DD/MM/YYYY.
- Gender: Determine if the candidate is "Male" or "Female".
  * HANDWRITTEN TICKS / CHECKBOXES: Look closely at gender options on paper forms (e.g. "M [ ] F [ ]", "Male / Female", "M / F", or checkboxes next to M and F).
  * A checkmark (✓), tick, cross (X), dot, circle, highlight, pen stroke, or box select on/near "M" or "Male" means "Male".
  * A checkmark (✓), tick, cross (X), dot, circle, highlight, pen stroke, or box select on/near "F" or "Female" means "Female".
  * If handwritten "M" or "Male" -> "Male". If handwritten "F" or "Female" -> "Female".
  * The Marathi form has no gender field. Infer it from: the declaration "मी लिहून देतो / देते" (the word NOT struck out: देतो = Male, देते = Female), checklist questions filled about a husband ("Husbands income profession", "Pregnancy plan") = Female, or a clearly male / female first name.
- MaritalStatus: "Single", "Married", "Unmarried", "Divorced", or "Widowed". Check checkboxes or text.
  * Marathi "अविवाहीत / विवाहीत": the ticked, circled or underlined option (the struck-out one is NOT chosen). If unclear, a number of children (अपत्यांची संख्या) of 1 or more, or the checklist option "Married (with one or two children)" being ticked, means "Married".
- Third name on the Marathi form ("वडिलांचे/पतीचे नाव" = father's OR husband's name): for a married woman it is her husband -> SpouseName "<that name> <surname>"; otherwise it is the father -> FatherName "<that name> <surname>". Father / Mother full names written on the checklist always go to FatherName / MotherName.
- DESIG: The post this candidate is applying for / offered at KF or Futura, ONLY from: "Position applied", "अर्ज करीत असलेले पद/हुद्दा", a designation written beside the LAB / DOJ notes (e.g. "Trainee"), or the offer letter ("ट्रेनी" = Trainee, "ट्रेनी/अप्रेन्टिस" = Trainee). If none of these is filled, return "".
  * Never take DESIG from qualification notes (e.g. "M.com" written at the top is a qualification), or from the candidate's present / previous job titles.
- JOIN_DT: Joining date at KF / Futura (DD/MM/YYYY), ONLY from an explicit joining date: "DOJ", "Date of Joining", a date written beside the LAB / Trainee notes on the checklist, or the reporting date in the offer letter ("दि. 01-07-2026 ... हजर राहणे").
  * NOT the form-filled date ("दिनांक", "Date:" at the bottom, signature dates), NOT the approval date, and NOT the joining date at the candidate's present / previous employer. If not written, return "".
- DEPT_NAME: Department at KF / Futura. Recruiters write it in short form beside LAB or in the offer letter heading: "(PIR)" -> "PIR", "Disp" / "Disp." -> "Dispatch", "MPR", "PGR", "MSR", "HSK", "Prod" -> "Production", "GH" -> "Green House". Return "" if not written for this candidate.
- LabDetails: The candidate's own lab / section, normalised: "Lab-1", "Futura Lab-1", "Futura-2", "kf-3", "L-2" -> "Lab 01" / "Lab 02" / "Lab 03"; or "Staff" / "Support Staff". Do not put the company or department here (for "KF Disp." -> COMPANY "KF", DEPT_NAME "Dispatch", LabDetails "").
  * Never take DEPT_NAME or LabDetails from a reference's lab ("Reference: Neha Sawant -> Futura-2" is the reference's lab).
- EPAN_NO: 10-character PAN number (e.g. ABCDE1234F).
- EMAILID: Email address.
- Address1 & Pin1: Permanent / native address and 6-digit pincode.
- Address2 & Pin2: Present / local / mailing address and 6-digit pincode. If marked "Same as above", "Same", or left blank because it matches permanent, duplicate Address1 and Pin1.
  * On the Marathi form: field 3 "सध्याचा संपूर्ण पत्ता" = PRESENT address -> Address2 / Pin2; field 4 "कायमस्वरूपी पत्ता" = PERMANENT address -> Address1 / Pin1. Keep them separate; a pincode belongs only to the address it is written in.
  * A ditto mark ("-||-", "--\"--", "do", "same") in one address means it is the same as the other address: copy it.
  * Marathi form field map: 1 पद/हुद्दा = DESIG, 2 संपूर्ण नाव (आडनाव, नाव, वडिलांचे/पतीचे नाव = surname, first name, father's/husband's name), 5 फोन/मो.नं = mobiles, 6 जन्मतारीख = BIRTH_DT and वय = age, वैवाहिक स्थिती अविवाहीत/विवाहीत = Unmarried/Married (the ticked or underlined one), 7 अपत्यांची संख्या = number of children, 8 शैक्षणिक पात्रता = qualification, 9 अवगत भाषा = languages, 11 पूर्वीचा कामाचा अनुभव = previous experience, 12 परिचयदात्याचे नाव = ReferenceName. "नाही" / "—" means none -> "".
- ADHAR_NO: 12-digit Aadhaar / UID number.
- PF_UAN: 12-digit Universal Account Number for Provident Fund.
- ESI_Number: ESI / IP insurance number.
- EMP_MobileNumber: 10-digit primary mobile contact number.
- Alternate_MobileNumber: Secondary / emergency / alternate contact number.

- FAMILY DETAILS:
  * FatherName & FatherDOB (DD/MM/YYYY)
  * MotherName & MotherDOB (DD/MM/YYYY)
  * SpouseName & SpouseDOB (DD/MM/YYYY)
  * Child1 & Child1DOB (DD/MM/YYYY)
  * Child2 & Child2DOB (DD/MM/YYYY)
  * Extract all members into 'extendedDetails.familyMembers' array.

- ACADEMIC QUALIFICATIONS ('extendedDetails.academics'):
  Extract ALL academic educational rows visible in the education table:
  10th/SSC, 12th/HSC, Diploma, Graduation/Bachelors (B.Sc, B.Com, B.Tech, etc.), Post-Graduation/Masters (M.Sc, MBA, etc.), PhD.
  Extract level, courseName, institute, boardUniversity, cityState, passYear, percentageOrCgpa.

- PREVIOUS EMPLOYMENT RECORDS ('extendedDetails.previousEmployments'):
  Extract ALL past employers and work experiences: the work history table AND handwritten notes anywhere on the pages (e.g. the recruiter's notes at the bottom of the Marathi form: "Cloudzia Outsourcing as CSR 1 year ... 12000", "Axis Max Life Insurance - 10 years - 28900", "Teacher - 4 year - Shree Swami Samarth Public School - 6000").
  organizationName, duration (e.g. "01/04/2019 to 30/11/2022", or "10 years" when only a length is written), fromDate, toDate, lastDesignation, emoluments, industry, reasonForLeaving.
  * Always fill duration when any length of service is written ("1 year", "1.5 year", "3 Year"), so experience can be calculated.
  * emoluments: This is the salary exactly as the candidate wrote it, NOT a CTC. Candidates usually write the monthly salary. Copy the amount as written and state the period: append " / month" when it is a monthly amount (e.g. "15,000 / month"), or " / annum" only if the form explicitly says per annum / yearly / LPA. If the period is unclear, treat amounts below 1,00,000 as monthly. Never convert or multiply the amount.
  * When the table has separate Joining and Leaving salary columns, keep both: "13,500 to 16,500 / month". Read each digit carefully.

- PRESENT EMPLOYMENT (PresentEmployment):
  Extract the candidate's CURRENT employer before joining us: company name, designation, place, starting date, and salary.
  * A reference's name is never an employer: do not put ReferenceName into previous or present employment (in any script, e.g. "कस्तुरी रसाळे" = "Kasturi Rasale").
  * "Housewife", "गृहिणी", "नाही", "—" are not work experience -> no previous employment entry.
  * The KF / Futura offer or the lab being joined is NOT present employment. If the candidate is not currently employed, return "".

- REFERENCE NAME (ReferenceName):
  Extract professional/personal references listed on the form (names, designations, companies, contact numbers).

- EXTENDED ATTRIBUTES:
  Extract bloodGroup (e.g. "O+", "A+", "B+"), heightFt, weightKg, identificationMarks, placeOfBirth, age, nationality, religion, category, domicileState, expectedSalary, ctcGrossPerAnnum, joiningAvailability, languages known.

--- MAPPING & CODES ---
KF DESIGNATION CODES: AC Technician:01, Accountant:02, Area Manager:03, Assistant:04, Asst. Executive:05, Asst. Manager:06, Asst. Manager HR & Admin:07, Asst. Supervisor:08, Asst. Tech. Manager:09, Asst. Vice President:10, Casual:11, Cleaner:12, Computer Operator:13, Crop Manager:14, Driver:15, Dy. General Manager:16, Electrician:17, Exe. Secretary:18, Executive:19, Field Assistant:20, Finance Manager:21, General Manager:22, General Manager Marketing:23, GH-Manager:24, Jr.Manager:25, Manager:26, Marketing Cum Technical Execue:27, Office Boy:28, Operator:29, Plumber:30, Product Manager:31, Receptionist:32, Regional Manager:33, Sales Coordinator:34, Security:35, Sr. Executive:36, Sr. Manager:37, Sr. Marketing Cum Tech. Execue:38, Sr. Supervisor:39, Sr.Technical Executive:40, Supervisor:41, Trainee:42, Trainee Asst. Executive:43, Trainee Asst. Supervisor:44, Trainee Comp. Operator:45, Trainee Driver:46, Trainee Field Assistant:47, Trainee Instrument Engineer:48, Trainee Makt.cum Tech. execute:49, Trainee Marketing Executive:50, Trainee Office Boy:51, Trainee Supervisor:52, Vice President:53, Zonal Manager:54, HK-Officer:55, Instrumentation Engineer:56, Trainee Executive:57, Sr. General Manager:58, President:59, Trainee Sales Co-ordinator:60, Co-ordinator:61, Sr.Marketing Executive:62, Apprentice:63, Director:64, Breeder:65, Jr.Breeder:66, Secretary:67, Sr.Sales & Marketing Executive:68, Dy.Green House Manager:69, Technical Manager:70, Trainee Store Assistant:71, Executive Assistant:72, Sr.Executive Business Develop.:73, Sales Officer:74, Market Development Officer:75, Trainee Research Associate:76, Research Associate:77, Sr.Accountant:78, Sr.Sales Co-ordinator:79, Deputy Manager:80.
KF DEPARTMENT CODES: Accounts:01, Admin:02, Admin HSK:03, BW:04, Calla GH:05, Cap-Wash:06, CN-GH:07, Contamination:08, Demo-GH:09, Initiation:10, Dispatch:11, Dress Wash:12, Embryo:13, Exim:14, Garden:15, GE-GH:16, GH-Organic Farming:17, GH -Plug Machine:18, GH/Mun-GH:19, GH-HSK:20, Green House:21, Gypso GH:22, House-keeping:23, HR & Admin:24, Hypol-Machine:25, IT:26, KF-BW:27, Lab-HSK:28, LAB-Sealing:29, Limonium GH:30, Maintenance:31, Marketing:32, MPR:33, MSR:34, Operations:35, PGR:36, PIR:37, Pots-GH:38, Production:39, R & D:40, Rose-GH:41, Security:42, Seed-GH:43, ST-GH:44, Stores:45, Pot Marketing:46, Veg.Seed / Seedlings:47, Pre-Dispatch & Quality:48, Caper-GH:49, Dendrobium:50, DH-PIR:51, PURCHASE:52, Media Dispensary Room:53.
FUTURA DESIGNATION CODES: Sr.Executive:01, Sr. Supervisor:02, Asst. Executive:03, Asst. Supervisor:04, Sr.Lab Manager:05, Executive:06, Supervisor:07, Operator:08, Trainee:09, Casual:10, Computer Operator:11, Apprentice:12, Director:13, Electrician:14, System Administrator:15, Assistant:16, Assistant Manager:17, Security:18, Company Secretary:19, Driver:20, Jr.Manager:21, HK-Officer:22, Sr. Manager:23, General Manager:24, Instrumentation Engineer:25, Manager:26, Security Officer:27, Associate:28, Plumber:29, Deputy General Manager:30, Coordinator:31.
FUTURA DEPARTMENT CODES: MPR:01, PIR:02, PGR:03, LAB-HSK:04, Contamination:05, Dispatch:06, Production:07, HSK:08, MSR:09, MDR:10, BW:11, Quality:12, Operations:13, Admin:14, Maintenance:15, IT:16, Purchase:17, Store:18, Exim:19, Security:20, HR:21, Accounts:22, Dress Wash:23, R&D:24, Green House:25.
KF SECTION CODES: Lab 01:03, Lab 02:01, Lab 03:08, Staff:05, Support Staff:06.
FUTURA SECTION CODES: Lab 01:01, Lab 02:02, Lab 03:05, Staff:04.
"""


# ------------------------------------------------------------------
# Field extraction helpers
# ------------------------------------------------------------------


def _compact(key: str) -> str:
    return re.sub(r"[^a-z0-9]", "", key.lower())


def _lookup(source: dict, possible_keys: list[str]) -> Optional[str]:
    # Lists / objects (e.g. an empty "academics" array) are not field text, never stringify them
    source = {k: v for k, v in source.items() if not isinstance(v, (list, dict))}
    for key in possible_keys:
        if source.get(key) is not None:
            val = str(source[key]).strip()
            if val and val != "-":
                return val

    compact_keys = {k: _compact(k) for k in source}
    for target in possible_keys:
        clean_target = _compact(target)
        matched = next((k for k, ck in compact_keys.items() if ck == clean_target), None)
        if matched is not None and source.get(matched) is not None:
            val = str(source[matched]).strip()
            if val and val != "-":
                return val
    return None


def extract_flexible_field(data: Any, possible_keys: list[str], fallback: str = "") -> str:
    """First non-empty value among `possible_keys` (exact, then fuzzy), at top level or in extendedDetails."""
    if not isinstance(data, dict):
        return fallback
    found = _lookup(data, possible_keys)
    if found is not None:
        return found
    ext = data.get("extendedDetails")
    if isinstance(ext, dict):
        found = _lookup(ext, possible_keys)
        if found is not None:
            return found
    return fallback


def _family_members(data: dict) -> list:
    if isinstance(data.get("familyMembers"), list):
        return data["familyMembers"]
    ext = data.get("extendedDetails")
    if isinstance(ext, dict) and isinstance(ext.get("familyMembers"), list):
        return ext["familyMembers"]
    return []


def _ext_list(data: dict, key: str) -> list:
    if isinstance(data.get(key), list):
        return data[key]
    ext = data.get("extendedDetails")
    if isinstance(ext, dict) and isinstance(ext.get(key), list):
        return ext[key]
    return []


def find_family_member_details(data: dict, keywords: list[str]) -> tuple[str, str]:
    for member in _family_members(data):
        if not isinstance(member, dict):
            continue
        rel = str(member.get("relationship") or member.get("relation") or "").lower()
        if any(kw.lower() in rel for kw in keywords):
            name = str(member.get("name") or member.get("fullName") or member.get("memberName") or "").strip()
            dob = str(
                member.get("dob") or member.get("birthDate") or member.get("dateOfBirth") or member.get("birth_dt") or ""
            ).strip()
            return name, dob
    return "", ""


def normalize_gender(gender: str) -> str:
    if not gender:
        return gender
    g = gender.strip().lower()
    male_marks = ("tick on m", "check on m", "marked m", "checked m")
    female_marks = ("tick on f", "check on f", "marked f", "checked f")
    if g in ("m", "male", "v m") or any(x in g for x in male_marks) or g.startswith("m ") or g.endswith(" m"):
        return "Male"
    if g in ("f", "female", "v f") or any(x in g for x in female_marks) or g.startswith("f ") or g.endswith(" f"):
        return "Female"
    if "female" in g or ("f" in g and "m" not in g):
        return "Female"
    if "male" in g or ("m" in g and "f" not in g):
        return "Male"
    return gender


def _reference_person(reference_name: str) -> str:
    """The person's name part of a reference such as "Kasturi Rasale - Futura-2 (32521)"."""
    person = _compact(re.split(r"[-(,/>→]", reference_name or "")[0])
    # Generic sources, not a person ("Self", "Walk in", "Pamplet" leaflet ad)
    return "" if person in ("self", "walkin", "pamplet", "pamphlet", "none", "na") else person


def _is_reference(text: Any, ref_key: str) -> bool:
    return len(ref_key) >= 4 and ref_key in _compact(str(text or ""))


def _drop_reference_jobs(jobs: list, reference_name: str) -> list:
    # The model sometimes lists the reference person as a previous employer
    ref_key = _reference_person(reference_name)
    return [j for j in jobs if not (isinstance(j, dict) and _is_reference(j.get("organizationName"), ref_key))]


def _drop_reference_lines(text: str, reference_name: str) -> str:
    ref_key = _reference_person(reference_name)
    return "\n".join(line for line in (text or "").split("\n") if not _is_reference(line, ref_key))


_NOT_CANDIDATE_COMPANY = re.compile(r"refer|परिचय|के\.?\s*एफ\.?\s*/\s*फ्यु", re.IGNORECASE)


def _company_evidence_ok(data: dict) -> bool:
    """False when the AI's own evidence shows the company came from a reference or the
    shared KF/Futura letterhead, neither of which identifies the candidate's company."""
    source = str(data.get("COMPANY_SOURCE") or "").strip().upper()
    evidence = str(data.get("COMPANY_EVIDENCE") or "")
    if not source and not evidence:
        return True  # older responses without evidence fields
    return source != "NONE" and not _NOT_CANDIDATE_COMPANY.search(evidence)


def _new_record_id(index: int) -> str:
    suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=5))
    return f"rec_{int(time.time() * 1000)}_{index}_{suffix}"


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def process_extracted_employee(data: dict, default_file_name: str, index: int = 0) -> dict:
    """Maps a raw AI-extracted object onto the master employee record, with codes, dates and experience."""
    f = lambda keys, fallback="": extract_flexible_field(data, keys, fallback)  # noqa: E731
    ext_raw = data.get("extendedDetails") if isinstance(data.get("extendedDetails"), dict) else {}

    name = f(["NAME", "Name", "name", "fullName", "full_name", "employeeName", "candidateName"])
    if not name and ext_raw:
        first = ext_raw.get("firstName") or ""
        middle = ext_raw.get("middleInitial") or ext_raw.get("middleName") or ""
        last = ext_raw.get("lastName") or ""
        name = " ".join(p for p in (last, first, middle) if p).strip()

    birth_dt = f(["BIRTH_DT", "birth_dt", "birthDt", "BirthDate", "birthDate", "dob", "DOB", "dateOfBirth", "date_of_birth"])
    gender = normalize_gender(f(["Gender", "gender", "GENDER", "sex", "Sex"]))
    marital_status = f(["MaritalStatus", "maritalStatus", "marital_status", "MARITAL_STATUS", "marital"])

    designation = f(["DESIG", "desig", "designation", "Designation", "post", "postAppliedFor", "position"])
    join_date = f(["JOIN_DT", "join_dt", "joinDt", "joinDate", "dateOfJoining", "date_of_joining", "doj", "DOJ"])
    department = f(["DEPT_NAME", "dept_name", "deptName", "department", "Department"])
    lab_details = f(["LabDetails", "labDetails", "lab_details", "lab", "Lab"])
    company_input = f(["COMPANY", "company", "companyName", "Company"])
    if not _company_evidence_ok(data):
        company_input = ""
    company = detect_company(company_input or lab_details)

    enrichment = enrich_employee_record(company, lab_details, designation, join_date, department)

    def code(field: str, keys: list[str]) -> str:
        return enrichment[field] if enrichment[field] != "-" else f(keys, "-")

    desig_code = code("DESIG_CODE", ["DESIG_CODE", "desigCode", "desig_code"])
    f_desig_code = code("F_DESIG_CODE", ["F_DESIG_CODE", "fDesigCode", "f_desig_code"])
    dept_code = code("DEPT_CODE", ["DEPT_CODE", "deptCode", "dept_code"])
    f_dept_code = code("F_DEPT_CODE", ["F_DEPT_CODE", "fDeptCode", "f_dept_code"])
    section_code = code("SECTION_CODE", ["SECTION_CODE", "sectionCode", "section_code"])
    f_section_code = code("F_SECTION_CODE", ["F_SECTION_CODE", "fSectionCode", "f_section_code"])

    calculated_prb = calculate_probation_date(join_date, designation)
    if calculated_prb != "-":
        probation_date = calculated_prb
    elif enrichment["PRB_DT"] != "-":
        probation_date = enrichment["PRB_DT"]
    else:
        probation_date = f(["PRB_DT", "prb_dt", "probationDate"], "-")
    if not probation_date or probation_date == "-":
        probation_date = join_date or "-"

    calculated_conf = calculate_confirmation_date(probation_date) if probation_date != "-" else "-"
    if calculated_conf != "-":
        confirmation_date = calculated_conf
    elif enrichment["CONF_DT"] != "-":
        confirmation_date = enrichment["CONF_DT"]
    else:
        confirmation_date = f(["CONF_DT", "conf_dt", "confirmationDate"], "-")

    epan = f(["EPAN_NO", "epan_no", "epanNo", "pan", "panNo", "pan_no", "PAN", "panNumber"], "-")
    # Handwritten emails are often read with spaces ("name 850 @gmail.com"); emails never contain them
    email = re.sub(r"\s+", "", f(["EMAILID", "emailId", "email_id", "email", "Email", "emailAddress"])).lower()
    addr1 = f(["Address1", "address1", "address_1", "permanentAddress", "permanent_address", "nativeAddress",
               "native_address", "address", "Address"])
    addr2 = f(["Address2", "address2", "address_2", "presentAddress", "present_address", "mailingAddress",
               "mailing_address", "localAddress"])
    pin1 = f(["Pin1", "pin1", "pin_1", "pincode1", "pincode_1", "pinCode1", "pincode", "pin"])
    pin2 = f(["Pin 2", "Pin2", "pin2", "pin_2", "pincode2", "pincode_2", "pinCode2"])

    def _is_same_marker(addr: str) -> bool:
        low = addr.lower().strip()
        return not low or low == "-" or "same as" in low or low in ("same", "as above", "do") or bool(re.fullmatch(r"[-|\"'\s]+", low))

    if addr1 and _is_same_marker(addr2):
        addr2 = addr1
        if (not pin2 or pin2 == "-") and pin1 and pin1 != "-":
            pin2 = pin1
    elif addr2 and _is_same_marker(addr1):
        addr1 = addr2
        if (not pin1 or pin1 == "-") and pin2 and pin2 != "-":
            pin1 = pin2

    adhar = f(["ADHAR_NO", "adhar_no", "adharNo", "aadhar", "aadhar_no", "aadharNo", "aadhaar", "aadhaar_no", "uid",
               "UID", "Aadhar"], "-")
    pf_uan = f(["PF_UAN", "pf_uan", "pfUan", "uan", "UAN", "pfNumber", "pf_no"], "-")
    esi_number = f(["ESI_Number", "esi_number", "esiNumber", "esi", "ESI", "esiNo"], "-")
    emp_mobile = f(["EMP_MobileNumber", "emp_mobile_number", "empMobileNumber", "mobile", "mobileNumber",
                    "mobile_number", "phone", "phoneNumber", "contact"])
    alt_mobile = f(["Alternate_MobileNumber", "alternate_mobile_number", "alternateMobileNumber", "altMobile",
                    "altPhone", "emergencyContact"], "-")

    father_name = f(["FatherName", "father_name", "fatherName", "father", "fathersName"])
    father_dob = f(["FatherDOB", "father_dob", "fatherDob", "fatherBirthDate"])
    if not father_name or not father_dob:
        n, d = find_family_member_details(data, ["father", "वडील", "बाबा"])
        father_name = father_name or n
        father_dob = father_dob or d

    mother_name = f(["MotherName", "mother_name", "motherName", "mother", "mothersName"])
    mother_dob = f(["MotherDOB", "mother_dob", "motherDob", "motherBirthDate"])
    if not mother_name or not mother_dob:
        n, d = find_family_member_details(data, ["mother", "आई"])
        mother_name = mother_name or n
        mother_dob = mother_dob or d

    spouse_name = f(["SpouseName", "spouse_name", "spouseName", "spouse", "husbandName", "wifeName"], "-")
    spouse_dob = f(["SpouseDOB", "spouse_dob", "spouseDob"], "-")
    if spouse_name == "-" or spouse_dob == "-":
        n, d = find_family_member_details(data, ["spouse", "husband", "wife", "पति", "पत्नी"])
        if spouse_name == "-" and n:
            spouse_name = n
        if spouse_dob == "-" and d:
            spouse_dob = d

    child1 = f(["Child1", "child_1", "child1", "sonName", "daughterName"], "-")
    child1_dob = f(["Child1DOB", "child_1_dob", "child1Dob"], "-")
    child2 = f(["Child2", "child_2", "child2"], "-")
    child2_dob = f(["Child2DOB", "child_2_dob", "child2Dob"], "-")
    if child1 == "-" or child1_dob == "-":
        child_keywords = ("son", "daughter", "child", "मुलगा", "मुलगी")
        children = [
            m for m in _family_members(data)
            if isinstance(m, dict) and any(k in str(m.get("relationship") or "").lower() for k in child_keywords)
        ]
        if len(children) > 0:
            if child1 == "-" and children[0].get("name"):
                child1 = children[0]["name"]
            if child1_dob == "-" and children[0].get("dob"):
                child1_dob = children[0]["dob"]
        if len(children) > 1:
            if child2 == "-" and children[1].get("name"):
                child2 = children[1]["name"]
            if child2_dob == "-" and children[1].get("dob"):
                child2_dob = children[1]["dob"]

    academics = _ext_list(data, "academics")
    qualification = f(["Qualification", "qualification", "education", "academics"])
    if (not qualification or qualification == "-") and academics:
        qualification = format_qualifications_list(academics)

    reference_name = f(["ReferenceName", "reference_name", "referenceName", "references", "reference"])

    previous_jobs = _drop_reference_jobs(_ext_list(data, "previousEmployments"), reference_name)
    prev_employment = _drop_reference_lines(
        f(["PreviousEmployment", "previous_employment", "previousEmployment", "experience", "workExperience"]),
        reference_name,
    )
    if (not prev_employment or prev_employment == "-") and previous_jobs:
        prev_employment = format_previous_employments_list(previous_jobs)

    present_employment = f(["PresentEmployment", "present_employment", "presentEmployment"])

    family_members = _family_members(data)
    extended_details = {
        **ext_raw,
        "academics": academics or ext_raw.get("academics") or [],
        "previousEmployments": previous_jobs,
        "familyMembers": family_members,
    }

    exp = calculate_employee_total_experience({
        "JOIN_DT": join_date,
        "PresentEmployment": present_employment,
        "PreviousEmployment": prev_employment,
        "extendedDetails": extended_details,
    })

    try:
        confidence = float(data.get("confidenceScore")) or 95
    except (TypeError, ValueError):
        confidence = 95

    raw_record = {
        "id": _new_record_id(index),
        "fileName": default_file_name or DEFAULT_FILE_NAME,
        "uploadedAt": _now_iso(),
        "confidenceScore": confidence,
        "COMPANY": enrichment["COMPANY"],
        "DESIG_CODE": desig_code,
        "F_DESIG_CODE": f_desig_code,
        "DEPT_CODE": dept_code,
        "F_DEPT_CODE": f_dept_code,
        "SECTION_CODE": section_code,
        "F_SECTION_CODE": f_section_code,
        "codeMappingStatus": enrichment["codeMappingStatus"],
        "NAME": name,
        "BIRTH_DT": birth_dt,
        "Gender": gender,
        "MaritalStatus": marital_status,
        "DESIG": designation,
        "JOIN_DT": join_date,
        "PRB_DT": probation_date,
        "CONF_DT": confirmation_date,
        "DEPT_NAME": department,
        "LabDetails": lab_details,
        "EPAN_NO": epan,
        "EMAILID": email,
        "Address1": addr1,
        "Address2": addr2,
        "Pin1": pin1,
        "Pin 2": pin2,
        "ADHAR_NO": adhar,
        "PF_UAN": pf_uan,
        "ESI_Number": esi_number,
        "EMP_MobileNumber": emp_mobile,
        "Alternate_MobileNumber": alt_mobile,
        "FatherName": father_name,
        "FatherDOB": father_dob,
        "MotherName": mother_name,
        "MotherDOB": mother_dob,
        "SpouseName": spouse_name,
        "SpouseDOB": spouse_dob,
        "Child1": child1,
        "Child1DOB": child1_dob,
        "Child2": child2,
        "Child2DOB": child2_dob,
        "Qualification": qualification,
        "PreviousEmployment": prev_employment,
        "PresentEmployment": present_employment,
        "PreviousExperience": exp["previousExperienceText"],
        "CurrentExperience": exp["currentExperienceText"],
        "TotalExperience": exp["totalExperienceText"],
        "PreviousExperienceMonths": exp["previousExperienceMonths"],
        "CurrentExperienceMonths": exp["currentExperienceMonths"],
        "TotalExperienceMonths": exp["totalExperienceMonths"],
        "ReferenceName": reference_name,
        "extendedDetails": extended_details,
    }

    return apply_sorted_bulleted_formatting(raw_record)


def _filled(value: Any) -> bool:
    return bool(value) and value != "-"


def enrich_incoming_record(rec: dict) -> dict:
    """Recomputes codes, probation/confirmation dates and experience for a record coming from the client."""
    company = rec.get("COMPANY") or detect_company(rec.get("LabDetails"))
    enrichment = enrich_employee_record(
        company,
        rec.get("LabDetails") or "",
        rec.get("DESIG") or "",
        rec.get("JOIN_DT") or "",
        rec.get("DEPT_NAME") or "",
    )

    calculated_probation = calculate_probation_date(rec.get("JOIN_DT"), rec.get("DESIG"))
    if calculated_probation != "-":
        probation = calculated_probation
    elif _filled(rec.get("PRB_DT")):
        probation = rec["PRB_DT"]
    else:
        probation = enrichment["PRB_DT"]
    if not probation or probation == "-":
        probation = rec.get("JOIN_DT") or "-"

    calculated_conf = calculate_confirmation_date(probation) if probation != "-" else "-"
    if calculated_conf != "-":
        confirmation = calculated_conf
    elif _filled(rec.get("CONF_DT")):
        confirmation = rec["CONF_DT"]
    else:
        confirmation = enrichment["CONF_DT"]

    exp = calculate_employee_total_experience(rec)

    def keep_or(field: str) -> str:
        # A blank enrichment code means the column does not apply to this company
        if enrichment[field] == "":
            return ""
        return rec[field] if _filled(rec.get(field)) else enrichment[field]

    normalized = {
        **rec,
        "COMPANY": enrichment["COMPANY"],
        "DESIG_CODE": keep_or("DESIG_CODE"),
        "F_DESIG_CODE": keep_or("F_DESIG_CODE"),
        "DEPT_CODE": keep_or("DEPT_CODE"),
        "F_DEPT_CODE": keep_or("F_DEPT_CODE"),
        "SECTION_CODE": keep_or("SECTION_CODE"),
        "F_SECTION_CODE": keep_or("F_SECTION_CODE"),
        "PRB_DT": probation,
        "CONF_DT": confirmation,
        "PreviousExperience": exp["previousExperienceText"],
        "CurrentExperience": exp["currentExperienceText"],
        "TotalExperience": exp["totalExperienceText"],
        "PreviousExperienceMonths": exp["previousExperienceMonths"],
        "CurrentExperienceMonths": exp["currentExperienceMonths"],
        "TotalExperienceMonths": exp["totalExperienceMonths"],
        "codeMappingStatus": enrichment["codeMappingStatus"],
    }
    return apply_sorted_bulleted_formatting(normalized)


_MERGE_FIELDS = ("DESIG", "DEPT_NAME", "LabDetails", "Qualification", "PreviousEmployment", "PresentEmployment", "ReferenceName")


def consolidate_and_merge_candidate_records(records: list[dict]) -> list[dict]:
    """Folds nameless supplementary-page records (e.g. page 2 of a form) into the preceding named record."""
    if len(records) <= 1:
        return list(records)

    consolidated: list[dict] = []
    for rec in records:
        name = str(rec.get("NAME") or "").strip()
        if name and name != "-" and "unknown" not in name.lower():
            consolidated.append(rec)
            continue

        if not consolidated:
            consolidated.append(rec)
            continue

        target = consolidated[-1]
        if not _filled(target.get("COMPANY")) and rec.get("COMPANY"):
            target["COMPANY"] = rec["COMPANY"]
        for field in _MERGE_FIELDS:
            if not _filled(target.get(field)) and _filled(rec.get(field)):
                target[field] = rec[field]
        if not _filled(target.get("TotalExperience")) and _filled(rec.get("TotalExperience")):
            target["TotalExperience"] = rec["TotalExperience"]
            if _filled(rec.get("PreviousExperience")):
                target["PreviousExperience"] = rec["PreviousExperience"]
            if _filled(rec.get("CurrentExperience")):
                target["CurrentExperience"] = rec["CurrentExperience"]

        target.update(enrich_incoming_record(target))

    return consolidated


async def extract_employee_records_from_parts(
    parts: list[dict],
    default_file_name: str,
    requested_model: Optional[str] = None,
) -> tuple[list[dict], str]:
    """Sends the documents to Gemini and returns (normalized records, model used).

    Each part is {"data": bytes, "mimeType": str, "fileName": str}.
    """
    file_summary = ", ".join(f"Doc {i + 1}: {p.get('fileName') or default_file_name}" for i, p in enumerate(parts))
    contents: list[types.Part] = [types.Part.from_bytes(data=p["data"], mime_type=p["mimeType"]) for p in parts]
    contents.append(types.Part.from_text(text=(
        f"Extract all employee onboarding records from the supplied document(s) ({file_summary}).\n\n"
        "If multiple uploaded files/pages belong to the SAME candidate employee, MERGE them into ONE complete record "
        "so no fields are missed.\n"
        "If they belong to DIFFERENT employees, extract each employee as a separate item in the 'records' array.\n\n"
        "CRITICAL INSTRUCTIONS:\n"
        "1. The document(s) may contain information in BOTH English and Marathi (Devanagari).\n"
        "2. For EVERY field, including Name, Date of Birth (DOB), Phone Number, Email, and Address, you MUST look for "
        "it and extract it from ANY page, regardless of language or page order.\n"
        "3. If data is missing in one place, search every other page. Do not leave these fields blank if they exist "
        "anywhere in the provided document set."
    )))

    async def operation(client: genai.Client, model_name: str) -> types.GenerateContentResponse:
        try:
            return await client.aio.models.generate_content(
                model=model_name,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_EXTRACTION_PROMPT,
                    response_mime_type="application/json",
                    response_schema=RESPONSE_SCHEMA,
                    max_output_tokens=8192,
                    temperature=0,
                ),
            )
        except Exception as schema_err:  # noqa: BLE001
            if is_account_error(schema_err) or is_retryable_error(schema_err) or is_not_found_error(schema_err):
                raise
            logger.warning("[Gemini API] Schema output failed on '%s', retrying in plain JSON mode: %s", model_name, schema_err)
            return await client.aio.models.generate_content(
                model=model_name,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=(
                        f'{SYSTEM_EXTRACTION_PROMPT}\nReturn output ONLY in valid JSON format matching {{"records": [...]}}.'
                    ),
                    response_mime_type="application/json",
                    max_output_tokens=8192,
                    temperature=0,
                ),
            )

    response, model_used = await execute_gemini_with_fallback(operation, requested_model)

    parsed = clean_and_repair_json(response.text or "{}")
    raw_records: list = []
    if isinstance(parsed, dict):
        if isinstance(parsed.get("records"), list) and parsed["records"]:
            raw_records = parsed["records"]
        elif parsed.get("NAME") or parsed.get("JOIN_DT") or parsed.get("DESIG"):
            raw_records = [parsed]
        elif isinstance(parsed.get("record"), dict):
            raw_records = [parsed["record"]]
    elif isinstance(parsed, list):
        raw_records = parsed

    raw_records = [r for r in raw_records if isinstance(r, dict)]
    if not raw_records:
        raise ValueError("No employee record data could be extracted from the document(s).")

    enriched = [
        process_extracted_employee(
            raw,
            (parts[idx].get("fileName") if idx < len(parts) else None) or default_file_name,
            idx,
        )
        for idx, raw in enumerate(raw_records)
    ]
    return consolidate_and_merge_candidate_records(enriched), model_used
