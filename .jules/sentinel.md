## 2025-05-24 - Partial Sanitization & Logic Gaps in Marketplace
**Vulnerability:** The `create_pack` endpoint sanitized `title` and `description` but missed `category`, `target_audience`, and `voice_goal`, leading to Stored XSS. It also failed to validate that `price_cents` was non-negative.
**Learning:** Developers often sanitize "obvious" user content (like descriptions) but forget structured fields (like categories/tags) which are also user-controlled. Also, numerical inputs must always be validated for logical bounds (e.g. price >= 0).
**Prevention:** Sanitize ALL string inputs from user requests, not just long-form text. Use strict validation for numerical business logic (prices, quantities).
