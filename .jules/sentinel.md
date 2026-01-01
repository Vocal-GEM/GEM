## 2025-02-14 - File Upload Vulnerability
**Vulnerability:** Unrestricted file uploads in `voice_quality.py` and `data.py` allowed uploading arbitrary file types (including potentially executable ones).
**Learning:** `secure_filename` only sanitizes the name, it does not validate the file type or extension. Explicit validation is required.
**Prevention:** Implemented strict allowlist validation for file extensions in `backend/app/validators.py` and enforced it on all upload endpoints.
