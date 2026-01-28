## 2025-02-14 - File Upload Vulnerability
**Vulnerability:** Unrestricted file uploads in `voice_quality.py` and `data.py` allowed uploading arbitrary file types (including potentially executable ones).
**Learning:** `secure_filename` only sanitizes the name, it does not validate the file type or extension. Explicit validation is required.
**Prevention:** Implemented strict allowlist validation for file extensions in `backend/app/validators.py` and enforced it on all upload endpoints.
## 2024-05-23 - Insecure File Upload Vulnerability
**Vulnerability:** The application relied solely on `werkzeug.utils.secure_filename` for file uploads, which only sanitizes the filename string (e.g., removing paths) but does not validate the file extension or content type. This allowed users to upload potentially dangerous files like `.py` scripts.
**Learning:** `secure_filename` is insufficient for security; it prevents path traversal but not malicious file content or types.
**Prevention:** Implemented a strict allowlist-based validation (`validate_file_upload`) in `backend/app/validators.py` that checks extensions against a safe list (audio, images, docs). Integrated this validation into all upload endpoints (`data.py`, `voice_quality.py`).
## 2024-05-23 - Unrestricted File Upload Vulnerability
**Vulnerability:** The `/api/upload` endpoint in `backend/app/routes/data.py` accepted files with any extension.
**Learning:** Even when using `secure_filename`, the file extension itself must be validated against an allowlist to prevent RCE (e.g., uploading `.php` or `.py` scripts) or XSS (e.g., uploading `.html`). Flask's `secure_filename` only cleans the string, it does not validate intent.
**Prevention:** Implement a strict allowlist of file extensions (e.g., `{'png', 'jpg', 'mp3', 'wav', ...}`) and reject any upload that does not match. Added `allowed_file` check in the route.
## 2024-05-23 - Arbitrary File Upload
**Vulnerability:** The `/api/upload` endpoint in `backend/app/routes/data.py` accepted any file type, including HTML/SVG (XSS) and potentially executable scripts.
**Learning:** `werkzeug.utils.secure_filename` only sanitizes the filename string (e.g. removes paths), it DOES NOT validate the file extension or content type. Relying on it alone is insufficient for security.
**Prevention:** Always implement an explicit `ALLOWED_EXTENSIONS` list and validate `filename.rsplit('.', 1)[1].lower()` against it. Do not rely on client-provided `Content-Type`.
## 2024-12-30 - Unrestricted File Upload
**Vulnerability:** The `upload_file` endpoint in `backend/app/routes/data.py` relied solely on `secure_filename` without validating file extensions or content types.
**Learning:** `secure_filename` sanitizes the filename string (removing directory traversal sequences) but does not validate the file type. This could allow attackers to upload executable scripts (e.g., `.py`, `.html`) if the storage location is web-accessible or if the files are processed insecurely.
**Prevention:** Always implement an allowlist of safe file extensions (e.g., images, audio) and validate the file extension against this list before processing the upload.
**Vulnerability:** The file upload endpoint `backend/app/routes/data.py` used `secure_filename` but did not validate file extensions, allowing upload of potentially malicious files (e.g., .py, .html).
**Learning:** `secure_filename` only sanitizes the filename string (e.g., directory traversal), it does NOT validate the file type or extension.
**Prevention:** Always implement an explicit whitelist of allowed file extensions (and MIME types if possible) and validate strictly before processing uploads.
## 2024-05-23 - Unrestricted File Upload
**Vulnerability:** The file upload endpoint `/api/upload` relied solely on `secure_filename` which cleans the filename but does not validate the file extension or content. This allowed uploading arbitrary files (e.g., .php, .exe) which could lead to Remote Code Execution (RCE) or stored XSS.
**Learning:** `secure_filename` is insufficient for security; it only ensures the filename is safe for the filesystem, not that the file content/type is safe for the application.
**Prevention:** Always implement a strict allowlist of file extensions (and ideally MIME types/content inspection) for any file upload functionality.
## 2024-05-23 - Arbitrary File Upload
**Vulnerability:** The `/upload` endpoint allowed uploading files with any extension, potentially allowing attackers to upload malicious scripts (e.g., HTML with XSS, PHP shells).
**Learning:** `secure_filename` only sanitizes the filename characters but does not validate the file extension or content type.
**Prevention:** Always implement an allowlist of safe file extensions (and MIME types if possible) for file uploads.
## 2025-05-22 - Unrestricted File Upload
**Vulnerability:** The `upload_file` endpoint in `backend/app/routes/data.py` allowed any file extension, potentially enabling Stored XSS or other attacks if malicious files (e.g., HTML, PHP) were uploaded and served.
**Learning:** Even when using `secure_filename`, file type validation is crucial. Relying on the frontend or obscure URLs is not enough.
**Prevention:** Implemented an `ALLOWED_EXTENSIONS` allowlist and a validation check before processing the upload. Also ensured necessary dependencies like `boto3` are present in `requirements.txt`.
## 2025-02-14 - API Rate Limiting
**Vulnerability:** Missing rate limiting on resource-intensive endpoints (`/chat`, `/analyze`, `/synthesize`) exposed the application to DoS attacks and excessive API costs (Gemini/ElevenLabs).
**Learning:** External API integrations and CPU-heavy tasks must always be rate-limited to prevent abuse and cost overruns.
**Prevention:** Applied `Flask-Limiter` decorators (`@limiter.limit`) to all high-cost/high-compute endpoints in `ai.py`, `voice_quality.py`, and `tts.py`.
## 2026-01-04 - Community File Upload Security
**Vulnerability:** The `share_voice` endpoint in `backend/app/routes/community.py` allowed unrestricted file uploads, enabling potential RCE via malicious scripts (e.g., .php).
**Learning:** Always validate file types explicitly, even when using `secure_filename`. Relative imports in Blueprint routes work, but testing them requires careful mocking of the package structure.
**Prevention:** Added `validate_file_upload` check restricting uploads to audio types only. Confirmed `backend/app/validators.py` exists and functions correctly.

## 2025-05-23 - Path Traversal & Rate Limiting in Community Routes
**Vulnerability:** The `share_voice` endpoint in `backend/app/routes/community.py` used raw filenames for uploads, creating a potential path traversal risk. It also lacked rate limiting, exposing the server to DoS attacks via heavy audio processing.
**Learning:** Even when filenames are prefixed with IDs/timestamps, failure to sanitize the original filename with `secure_filename` is a security bad practice that can lead to filesystem attacks. Resource-intensive endpoints must always have strict rate limits.
**Prevention:** Applied `werkzeug.utils.secure_filename` to sanitize uploads and added `@limiter.limit` to `share_voice` (5/hour) and `submit_success_story` (10/minute).
## 2025-05-23 - Temporary File Leakage (DoS Risk)
**Vulnerability:** Flask endpoints using `tempfile.NamedTemporaryFile(delete=False)` followed by `send_file` often leak files because execution flow returns before `finally` blocks can effectively cleanup (since `send_file` needs the file to exist).
**Learning:** `finally` blocks in a route function run *before* the response is sent by the WSGI server. If you delete the file in `finally`, `send_file` fails. If you don't, the file leaks.
**Prevention:** Use `flask.after_this_request` to register a cleanup callback that deletes the temporary file after the response has been successfully sent.
## 2024-05-22 - Broken File Upload Validation Logic
**Vulnerability:** The `validate_file_upload` function expects a list of *categories* (e.g., `['audio']`), but consumers like `ai.py` were passing a set of *extensions* (e.g., `{'pdf'}`). This mismatch results in an empty allowlist, effectively blocking all uploads (Denial of Service). If a developer attempted to fix the call site without understanding the underlying logic (e.g. by forcing the extensions), they might inadvertently bypass validation or create confusion. Additionally, `md` files were missing from the 'document' category.
**Learning:** Logic mismatches between validator definitions and their consumers can lead to "fail-closed" bugs that look secure but are actually broken functionality, which can tempt developers to disable security checks entirely to "get it working".
**Prevention:** Use type hints and strict validation in utility functions. If a function expects specific keys, raise an error immediately if invalid keys are passed during development (e.g., `ValueError` if `allowed_types` contains unknown categories).

## 2026-01-09 - Unrestricted File Upload in Community Module
**Vulnerability:** The `share_voice` endpoint accepted any file type and saved it to disk with an insecure filename construction, allowing potential Remote Code Execution (RCE) via malicious uploads (e.g., .html, .php) or path traversal.
**Learning:** Relying on frontend validation or assuming "trusted users" (authenticated) is insufficient. Filenames must always be sanitized and validated against a strict allowlist on the backend before any filesystem operations.
**Prevention:** Always use `secure_filename` and explicit content-type/extension validation (e.g. `validate_file_upload`) for every file upload endpoint.

## 2024-05-22 - Stored XSS in Community Features
**Vulnerability:** User input in `submit_success_story` (title, story), `share_voice` (context), and `request_connection` (message) was stored directly in the database without sanitization. An attacker could inject malicious scripts (e.g., `<script>`) that would execute when other users viewed these stories or messages.
**Learning:** Even with backend API validation (like checking file types or bad words), explicit HTML sanitization is required for any text field that might be rendered or stored. `check_moderation` only flagged keywords but didn't prevent code injection.
**Prevention:** Apply `sanitize_html` (using `bleach`) to all user-submitted text fields before saving to the database. Ensure this pattern is followed for all new endpoints accepting text input.
## 2026-02-14 - Information Leakage & Logic Error in Finally Block
**Vulnerability:** A `return` statement in a `finally` block in `backend/app/routes/voice_quality.py` was suppressing all exceptions (causing `UnboundLocalError` when no exception occurred) and leaking raw exception strings when an error did occur.
**Learning:** `return` in `finally` discards any active exception and overrides return values from `try`/`except`. This is a dangerous anti-pattern in Python. Also, using `print()` for error logging is insufficient for production monitoring.
**Prevention:** Removed the `return` statement from the `finally` block to ensure exceptions propagate or are handled by the `except` block's return. Replaced `print()` with `current_app.logger.error()` for proper logging. Validated with a targeted test suite.
## 2026-01-23 - Information Leakage in Settings Update
**Vulnerability:** The `update_settings` endpoint in `backend/app/routes/settings.py` was catching all exceptions and returning `str(e)` in the JSON response. This exposes sensitive details (e.g., database connection errors, SQL syntax issues) to the client.
**Learning:** Developers often return exception strings during development for debugging but forget to sanitize them for production. Flask Blueprints require `current_app` to access the logger properly.
**Prevention:**
1. Always use a generic error message for the client (e.g., "Failed to update settings").
2. Log the full exception details on the server using `current_app.logger.error(f"Error: {str(e)}")`.
3. Add security unit tests that explicitly mock failure scenarios and assert that the exception details are NOT present in the response.

## 2024-05-22 - Marketplace Validation Gap
**Vulnerability:** The marketplace `create_pack` endpoint accepted negative prices and arbitrary strings for restricted fields (category, audience), allowing potential financial logic bypass and database pollution.
**Learning:** The app relies on `sanitize_html` for XSS but lacks domain-specific validation (allowed values, numeric ranges) for business logic fields.
**Prevention:** Always validate inputs against allowlists (enums) and numeric ranges, not just sanitizing for XSS.
