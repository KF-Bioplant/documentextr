"""Gemini API access with multi-key / multi-model failover, and tolerant JSON parsing of model output."""

from __future__ import annotations

import asyncio
import json
import logging
import random
import re
from typing import Any, Awaitable, Callable, Optional, TypeVar

from google import genai
from google.genai import types

from .config import get_available_api_keys, get_configured_models

logger = logging.getLogger("gemini")

T = TypeVar("T")

MAX_RETRIES = 4


def get_candidate_models(requested_model: Optional[str] = None) -> list[str]:
    """Requested model first, followed by the configured fallback models."""
    result: list[str] = []
    clean = (requested_model or "").strip()
    if clean:
        if "2.5-flash" in clean:
            clean = "gemini-3.5-flash-lite"
        result.append(clean)
    for model in get_configured_models():
        if model not in result:
            result.append(model)
    return result


def get_backoff_delay_with_jitter(attempt: int) -> float:
    """~1s, ~2s, ~4s, ~8s with +/-15% jitter (seconds)."""
    delays = [1.0, 2.0, 4.0, 8.0]
    base = delays[min(attempt, len(delays) - 1)]
    jitter = (random.random() * 0.3 - 0.15) * base
    return max(0.6, base + jitter)


def _error_status(err: Any) -> Any:
    for attr in ("code", "status", "status_code"):
        value = getattr(err, attr, None)
        if value:
            return value
    return None


def _error_text(err: Any) -> str:
    return (str(err) or repr(err)).lower()


def is_not_found_error(err: Any) -> bool:
    """404 / NOT_FOUND / unsupported model: never retry on the same model."""
    if err is None:
        return False
    status = _error_status(err)
    lower = _error_text(err)
    return (
        status in (404, "NOT_FOUND")
        or "404" in lower
        or "not_found" in lower
        or "not found" in lower
        or "not supported for generatecontent" in lower
        or "is not found for api version" in lower
        or "unsupported model" in lower
    )


class GeminiAccountError(RuntimeError):
    """Every API key was rejected (billing / credits / invalid key); retrying cannot help."""


def is_account_error(err: Any) -> bool:
    """402 / 401 / 403, depleted credits, billing or invalid key: fails for every model on this key."""
    if err is None:
        return False
    status = _error_status(err)
    lower = _error_text(err)
    markers = (
        "prepayment credits", "credits are depleted", "billing", "api key not valid", "api_key_invalid",
        "permission_denied", "unauthenticated",
    )
    return status in (401, 402, 403, "PERMISSION_DENIED", "UNAUTHENTICATED") or any(m in lower for m in markers)


def is_retryable_error(err: Any) -> bool:
    """Temporary errors (429, 5xx, quota, network) that are worth retrying with backoff."""
    if err is None or is_not_found_error(err) or is_account_error(err):
        return False
    if isinstance(err, (asyncio.TimeoutError, ConnectionError, TimeoutError)):
        return True
    status = _error_status(err)
    lower = _error_text(err)
    markers = (
        "429", "503", "502", "504", "unavailable", "high demand", "overloaded", "resource_exhausted",
        "quota", "rate limit", "fetch failed", "econnreset", "etimedout", "socket hang up", "network",
        "timeout", "timed out", "connection",
    )
    return status in (429, 502, 503, 504, "UNAVAILABLE", "RESOURCE_EXHAUSTED") or any(m in lower for m in markers)


def _api_retry_delay(err: Any) -> Optional[float]:
    """Reads google.rpc.RetryInfo.retryDelay (e.g. "35s") from the error payload, if present."""
    details = getattr(err, "details", None)
    if isinstance(details, dict):
        details = (details.get("error") or {}).get("details", details.get("details"))
    if not isinstance(details, list):
        return None
    for item in details:
        if isinstance(item, dict) and item.get("@type") == "type.googleapis.com/google.rpc.RetryInfo":
            try:
                return float(str(item.get("retryDelay", "")).rstrip("s"))
            except ValueError:
                return None
    return None


async def execute_gemini_with_fallback(
    operation: Callable[[genai.Client, str], Awaitable[T]],
    requested_model: Optional[str] = None,
) -> tuple[T, str]:
    """Runs `operation` across API keys and candidate models.

    404 / unsupported model -> next model immediately. Temporary errors -> exponential backoff
    retries on the same model, then the next model. Billing / invalid key -> next API key immediately.
    All models exhausted -> next API key.
    """
    keys = get_available_api_keys()
    if not keys:
        raise RuntimeError("GEMINI_API_KEY is not configured in environment variables")

    model_order = get_candidate_models(requested_model)
    last_error: Optional[BaseException] = None
    account_errors = 0

    for key_idx, api_key in enumerate(keys):
        key_rejected = False
        client = genai.Client(
            api_key=api_key,
            http_options=types.HttpOptions(headers={"User-Agent": "kf-bioplant-excel-exporter"}),
        )

        for model_name in model_order:
            for attempt in range(MAX_RETRIES + 1):
                try:
                    result = await operation(client, model_name)
                    return result, model_name
                except Exception as err:  # noqa: BLE001 - every failure is classified below
                    last_error = err
                    logger.warning(
                        "[Gemini API] Key #%d/%d, model '%s' attempt %d failed: %s",
                        key_idx + 1, len(keys), model_name, attempt + 1, err,
                    )

                    if is_account_error(err):
                        logger.error("[Gemini API] Key #%d rejected (billing / credits / invalid key). Skipping its models.", key_idx + 1)
                        key_rejected = True
                        break

                    if is_not_found_error(err):
                        logger.info("[Gemini API] Model '%s' unsupported / not found. Moving to next model.", model_name)
                        break

                    if is_retryable_error(err) and attempt < MAX_RETRIES:
                        delay = get_backoff_delay_with_jitter(attempt)
                        api_delay = _api_retry_delay(err)
                        if api_delay is not None:
                            delay = max(delay, api_delay + 2)
                        logger.info(
                            "[Gemini API] Temporary error on '%s'. Retry %d/%d in %.1fs...",
                            model_name, attempt + 2, MAX_RETRIES + 1, delay,
                        )
                        await asyncio.sleep(delay)
                        continue

                    if attempt >= MAX_RETRIES:
                        logger.warning("[Gemini API] Retries exhausted for '%s'. Moving to next model.", model_name)
                    break
            if key_rejected:
                break

        if key_rejected:
            account_errors += 1

        if key_idx < len(keys) - 1:
            logger.warning("[Gemini API] All models exhausted on key #%d. Switching to key #%d.", key_idx + 1, key_idx + 2)

    final_message = str(last_error) if last_error else "Unknown Gemini AI processing error"
    if account_errors == len(keys):
        raise GeminiAccountError(
            "Gemini API rejected the configured API key(s): billing / prepaid credits are exhausted or the key is "
            f"invalid. Top up credits or set a working GEMINI_API_KEY in backend/.env. Details: {final_message}"
        )
    raise RuntimeError(
        f"All Gemini AI models and API keys failed after full retries and failover. Last error: {final_message}"
    )


def clean_and_repair_json(raw_text: str) -> Any:
    """Parses model JSON output, repairing code fences, control chars, truncation, and unclosed brackets."""
    if not raw_text or not raw_text.strip():
        return {}
    cleaned = raw_text.strip()

    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s*```\s*$", "", cleaned)
    cleaned = cleaned.strip()

    # 1. Direct parse
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # 2. Unescaped control characters inside strings
    try:
        def _escape(match: re.Match) -> str:
            ch = match.group(0)
            return {"\n": "\\n", "\r": "\\r", "\t": "\\t"}.get(ch, "")

        return json.loads(re.sub(r"[\u0000-\u001F\u007F-\u009F]", _escape, cleaned))
    except json.JSONDecodeError:
        pass

    # 3. Truncated output: close open string, drop trailing partial pair, close brackets
    try:
        repaired = cleaned
        in_string = False
        escaped = False
        stack: list[str] = []
        for ch in repaired:
            if escaped:
                escaped = False
                continue
            if ch == "\\":
                escaped = True
                continue
            if ch == '"':
                in_string = not in_string
                continue
            if not in_string:
                if ch in "{[":
                    stack.append(ch)
                elif ch == "}" and stack and stack[-1] == "{":
                    stack.pop()
                elif ch == "]" and stack and stack[-1] == "[":
                    stack.pop()

        if in_string:
            repaired += '"'

        repaired = re.sub(r',\s*"[^"]*"\s*:\s*$', "", repaired)
        repaired = re.sub(r":\s*$", ": null", repaired)
        repaired = re.sub(r',\s*"[^"]*"$', "", repaired)
        repaired = re.sub(r",\s*$", "", repaired)

        while stack:
            repaired += "}" if stack.pop() == "{" else "]"

        return json.loads(repaired)
    except json.JSONDecodeError:
        pass

    # 4. Regex fallback: pull out any complete employee-like objects
    found: list[dict] = []
    for match in re.finditer(r'\{[\s\S]*?"(?:NAME|Name|name)"\s*:\s*"([^"]+)"[\s\S]*?\}', cleaned):
        try:
            obj = json.loads(re.sub(r",\s*([}\]])", r"\1", match.group(0)))
        except json.JSONDecodeError:
            continue
        if isinstance(obj, dict) and (obj.get("NAME") or obj.get("DESIG") or obj.get("JOIN_DT")):
            found.append(obj)
    if found:
        return {"records": found}

    raise ValueError(f"Unable to parse or repair JSON output: {cleaned[:200]}...")
