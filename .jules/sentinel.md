## 2025-05-23 - Temporary File Leakage (DoS Risk)
**Vulnerability:** Flask endpoints using `tempfile.NamedTemporaryFile(delete=False)` followed by `send_file` often leak files because execution flow returns before `finally` blocks can effectively cleanup (since `send_file` needs the file to exist).
**Learning:** `finally` blocks in a route function run *before* the response is sent by the WSGI server. If you delete the file in `finally`, `send_file` fails. If you don't, the file leaks.
**Prevention:** Use `flask.after_this_request` to register a cleanup callback that deletes the temporary file after the response has been successfully sent.
