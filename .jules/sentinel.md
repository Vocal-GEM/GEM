## 2024-05-23 - Unrestricted File Upload Vulnerability
**Vulnerability:** The `/api/upload` endpoint in `backend/app/routes/data.py` accepted files with any extension.
**Learning:** Even when using `secure_filename`, the file extension itself must be validated against an allowlist to prevent RCE (e.g., uploading `.php` or `.py` scripts) or XSS (e.g., uploading `.html`). Flask's `secure_filename` only cleans the string, it does not validate intent.
**Prevention:** Implement a strict allowlist of file extensions (e.g., `{'png', 'jpg', 'mp3', 'wav', ...}`) and reject any upload that does not match. Added `allowed_file` check in the route.
