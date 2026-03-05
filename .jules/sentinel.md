## 2024-03-05 - Stored XSS in flag_content route
**Vulnerability:** The `flag_content` route in `backend/app/routes/community.py` accepted raw input for `content_type` and `reason` without sanitization, leading to a potential Stored XSS vulnerability.
**Learning:** Even internal or moderation-facing endpoints need input sanitization. The vulnerability existed because data from `request.get_json()` was directly mapped to model fields.
**Prevention:** Always use `sanitize_html` or equivalent input validation on all text fields before inserting them into the database, regardless of the user role or the visibility of the data.
