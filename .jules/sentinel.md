## 2024-05-23 - Arbitrary File Upload
**Vulnerability:** The `/api/upload` endpoint in `backend/app/routes/data.py` accepted any file type, including HTML/SVG (XSS) and potentially executable scripts.
**Learning:** `werkzeug.utils.secure_filename` only sanitizes the filename string (e.g. removes paths), it DOES NOT validate the file extension or content type. Relying on it alone is insufficient for security.
**Prevention:** Always implement an explicit `ALLOWED_EXTENSIONS` list and validate `filename.rsplit('.', 1)[1].lower()` against it. Do not rely on client-provided `Content-Type`.
