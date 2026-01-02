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
