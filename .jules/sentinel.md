## 2025-05-23 - Inconsistent File Upload Validation
**Vulnerability:** Despite having a `validate_file_upload` utility, multiple endpoints (`/api/analyze` and `/api/community/share-voice`) processed file uploads without calling it, allowing arbitrary file uploads (e.g., `.exe` or scripts).
**Learning:** Utilities only work if they are consistently applied. Code duplication (copy-pasting upload logic) often leads to missing security checks in new features.
**Prevention:** Audited all file upload points. In the future, consider a centralized decorator or middleware for file handling to enforce validation automatically.
