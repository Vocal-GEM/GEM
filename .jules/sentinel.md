## 2024-12-30 - Unrestricted File Upload
**Vulnerability:** The file upload endpoint `backend/app/routes/data.py` used `secure_filename` but did not validate file extensions, allowing upload of potentially malicious files (e.g., .py, .html).
**Learning:** `secure_filename` only sanitizes the filename string (e.g., directory traversal), it does NOT validate the file type or extension.
**Prevention:** Always implement an explicit whitelist of allowed file extensions (and MIME types if possible) and validate strictly before processing uploads.
