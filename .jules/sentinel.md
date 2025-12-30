## 2024-12-30 - Unrestricted File Upload
**Vulnerability:** The `upload_file` endpoint in `backend/app/routes/data.py` relied solely on `secure_filename` without validating file extensions or content types.
**Learning:** `secure_filename` sanitizes the filename string (removing directory traversal sequences) but does not validate the file type. This could allow attackers to upload executable scripts (e.g., `.py`, `.html`) if the storage location is web-accessible or if the files are processed insecurely.
**Prevention:** Always implement an allowlist of safe file extensions (e.g., images, audio) and validate the file extension against this list before processing the upload.
