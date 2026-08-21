## 2024-05-24 - Information Exposure via Generic Exceptions
**Vulnerability:** Raw exception strings (e.g., `str(e)`) were being returned directly to the client within `jsonify` calls inside endpoint error handlers (specifically `tts.py` and `voice_quality.py`).
**Learning:** Returning unhandled or generic exception strings exposes sensitive server architecture, dependency specifics, and internal execution states, aiding an attacker in further exploitation.
**Prevention:** Always log the detailed exception string on the server using `current_app.logger.error()` and return a sanitized, generic error message (e.g., "An internal error occurred") to the client.
