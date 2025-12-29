## 2024-05-23 - Arbitrary File Upload
**Vulnerability:** The `/upload` endpoint allowed uploading files with any extension, potentially allowing attackers to upload malicious scripts (e.g., HTML with XSS, PHP shells).
**Learning:** `secure_filename` only sanitizes the filename characters but does not validate the file extension or content type.
**Prevention:** Always implement an allowlist of safe file extensions (and MIME types if possible) for file uploads.
