## 2024-05-23 - Insecure File Upload Vulnerability
**Vulnerability:** The application relied solely on `werkzeug.utils.secure_filename` for file uploads, which only sanitizes the filename string (e.g., removing paths) but does not validate the file extension or content type. This allowed users to upload potentially dangerous files like `.py` scripts.
**Learning:** `secure_filename` is insufficient for security; it prevents path traversal but not malicious file content or types.
**Prevention:** Implemented a strict allowlist-based validation (`validate_file_upload`) in `backend/app/validators.py` that checks extensions against a safe list (audio, images, docs). Integrated this validation into all upload endpoints (`data.py`, `voice_quality.py`).
