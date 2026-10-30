"""FastAPI entry point for the KF Bioplants / Futura employee form extractor and Excel exporter.

Run (from the backend folder):  uvicorn app.main:app --reload --port 8000
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from .config import BACKEND_DIR, CORS_ORIGINS, get_available_api_keys
from .routers import employees, export, extract

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s [%(name)s] %(message)s")
logger = logging.getLogger("app")

app = FastAPI(title="KF Bio Plant Excel Exporter API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", tags=["health"])
async def health():
    return {
        "status": "ok",
        "configuredGeminiKeys": len(get_available_api_keys()),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


app.include_router(employees.router)
app.include_router(extract.router)
app.include_router(export.router)


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    message = "API route not found" if exc.status_code == 404 else str(exc.detail)
    return JSONResponse(status_code=exc.status_code, content={"success": False, "error": message})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(status_code=400, content={"success": False, "error": "Invalid request body", "details": exc.errors()})


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled API error")
    return JSONResponse(status_code=500, content={"success": False, "error": str(exc) or "Internal server error occurred"})


# Serve the built frontend (frontend/dist) when present, so one process can host the whole app in production.
FRONTEND_DIST = BACKEND_DIR.parent / "frontend" / "dist"

if FRONTEND_DIST.is_dir():

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_frontend(full_path: str):
        if full_path.startswith("api/") or full_path == "api":
            return JSONResponse(status_code=404, content={"success": False, "error": "API route not found"})
        candidate = (FRONTEND_DIST / full_path).resolve()
        if full_path and candidate.is_file() and FRONTEND_DIST.resolve() in candidate.parents:
            return FileResponse(candidate)
        return FileResponse(FRONTEND_DIST / "index.html")
