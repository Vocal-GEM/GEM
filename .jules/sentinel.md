## 2025-05-23 - Temporary File Leakage (DoS Risk)
**Vulnerability:** Flask endpoints using `tempfile.NamedTemporaryFile(delete=False)` followed by `send_file` often leak files because execution flow returns before `finally` blocks can effectively cleanup (since `send_file` needs the file to exist).
**Learning:** `finally` blocks in a route function run *before* the response is sent by the WSGI server. If you delete the file in `finally`, `send_file` fails. If you don't, the file leaks.
**Prevention:** Use `flask.after_this_request` to register a cleanup callback that deletes the temporary file after the response has been successfully sent.
## 2024-05-22 - Broken File Upload Validation Logic
**Vulnerability:** The `validate_file_upload` function expects a list of *categories* (e.g., `['audio']`), but consumers like `ai.py` were passing a set of *extensions* (e.g., `{'pdf'}`). This mismatch results in an empty allowlist, effectively blocking all uploads (Denial of Service). If a developer attempted to fix the call site without understanding the underlying logic (e.g. by forcing the extensions), they might inadvertently bypass validation or create confusion. Additionally, `md` files were missing from the 'document' category.
**Learning:** Logic mismatches between validator definitions and their consumers can lead to "fail-closed" bugs that look secure but are actually broken functionality, which can tempt developers to disable security checks entirely to "get it working".
**Prevention:** Use type hints and strict validation in utility functions. If a function expects specific keys, raise an error immediately if invalid keys are passed during development (e.g., `ValueError` if `allowed_types` contains unknown categories).

## 2026-01-09 - Unrestricted File Upload in Community Module
**Vulnerability:** The `share_voice` endpoint accepted any file type and saved it to disk with an insecure filename construction, allowing potential Remote Code Execution (RCE) via malicious uploads (e.g., .html, .php) or path traversal.
**Learning:** Relying on frontend validation or assuming "trusted users" (authenticated) is insufficient. Filenames must always be sanitized and validated against a strict allowlist on the backend before any filesystem operations.
**Prevention:** Always use `secure_filename` and explicit content-type/extension validation (e.g. `validate_file_upload`) for every file upload endpoint.
