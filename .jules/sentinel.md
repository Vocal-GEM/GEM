## 2025-03-08 - Prevent Internal Exception Exposure via API Errors
**Vulnerability:** API endpoints (e.g., `voice_quality.py`, `tts.py`, `__init__.py`) were returning raw exception strings (`str(e)`) to the client when handling errors.
**Learning:** Returning unhandled exception messages directly to the client can leak sensitive internal system information, file paths, or infrastructure details, creating an Information Exposure risk.
**Prevention:** Always catch exceptions and log the detailed error server-side while returning generic, sanitized error messages to the client. Never expose `str(e)` directly in API responses like `jsonify()`.
