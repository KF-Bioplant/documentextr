# KF Bio Plant Excel Exporter

Scans handwritten employee personal-data forms (PDF / images), extracts the details with Gemini AI,
maps them to the KF Bioplants / Futura master codes, and exports the master-format Excel sheet.

```
frontend/   React 19 + Vite + Tailwind CSS v4 (UI)
backend/    FastAPI (AI extraction, code mapping, storage, Excel export)
```

## Prerequisites

- Node.js 20+
- Python 3.11+

## 1. Backend (FastAPI) — http://localhost:8000

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows  (macOS/Linux: source .venv/bin/activate)
pip install -r requirements.txt
copy .env.example .env          # macOS/Linux: cp .env.example .env
```

Edit `backend/.env` and set at least `GEMINI_API_KEY`. Set `MONGODB_URI` (MongoDB Atlas connection string)
and optionally `MONGODB_DB` (default `kf_bio_plant`) to store records in MongoDB; without them, records are kept in
`backend/data/employees.json`.

```bash
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

Create the `employees` collection (schema validator + indexes) once; this also imports any records from
`backend/data/employees.json`:

```bash
python -m scripts.setup_db
```

## 2. Frontend (React + Tailwind) — http://localhost:5173

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies every `/api/*` request to the backend on port 8000
(override with `VITE_API_PROXY_TARGET` in `frontend/.env`).

## Production

```bash
cd frontend && npm run build          # type-checks and outputs frontend/dist
cd ../backend && uvicorn app.main:app --host 0.0.0.0 --port 8000
```

When `frontend/dist` exists, the backend also serves the built UI, so a single process hosts the whole app.

## API

| Method | Path                   | Purpose                                                   |
| ------ | ---------------------- | --------------------------------------------------------- |
| GET    | `/api/health`          | Health check and number of configured Gemini keys         |
| GET    | `/api/employees`       | List saved employee records                               |
| PUT    | `/api/employees/{id}`  | Update a record                                           |
| DELETE | `/api/employees/{id}`  | Delete a record                                           |
| POST   | `/api/extract`         | Multipart `files` (up to 50) + `model` → extracted records |
| POST   | `/api/export-excel`    | `{ "records": [...] }` → `.xlsx` download                 |

## Notes

- The code-mapping, probation-date, experience and list-formatting rules exist in both
  `frontend/src` (live preview while editing) and `backend/app` (extraction and export).
  Keep `companyCodes.ts` ↔ `company_codes.py`, `experienceCalculator.ts` ↔ `experience.py`
  and `listFormatter.ts` ↔ `list_formatter.py` in sync when the rules change.
