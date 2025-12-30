## 2024-05-23 - Unrestricted File Upload
**Vulnerability:** The file upload endpoint `/api/upload` relied solely on `secure_filename` which cleans the filename but does not validate the file extension or content. This allowed uploading arbitrary files (e.g., .php, .exe) which could lead to Remote Code Execution (RCE) or stored XSS.
**Learning:** `secure_filename` is insufficient for security; it only ensures the filename is safe for the filesystem, not that the file content/type is safe for the application.
**Prevention:** Always implement a strict allowlist of file extensions (and ideally MIME types/content inspection) for any file upload functionality.
