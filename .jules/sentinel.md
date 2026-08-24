## YYYY-MM-DD - [Info Leakage Fix]
**Vulnerability:** Internal exception details (`str(e)`) directly exposed to the client in JSON error payloads via API endpoints (e.g., `/api/tts/synthesize`, `/api/voice-quality/manipulate`).
**Learning:** Returning `str(e)` safely masks exceptions internally but leaks critical system paths, module errors, or service constraints to attackers when blindly forwarded to the client payload.
**Prevention:** Catch blocks must log raw exceptions server-side (`current_app.logger.error()`) while explicitly sanitizing the client-facing `jsonify` response to a generic error message string.
