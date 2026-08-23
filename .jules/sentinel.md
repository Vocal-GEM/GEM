## 2024-05-10 - [MEDIUM] Error Message Information Leakage
**Vulnerability:** Information Exposure through error messages. In multiple files (`app/__init__.py`, `tts.py`, `voicelab_service.py`, `validators.py`), the application was returning `str(e)` directly to the client, which can leak stack traces or internal system details.
**Learning:** Returning generic python exception strings `str(e)` directly inside JSON responses leaks internals.
**Prevention:** Catch exception and log it using `current_app.logger.error(e)`, while replacing the user-facing message with generic strings.
