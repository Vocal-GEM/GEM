## 2024-05-23 - Critical Feedback Accessibility
**Learning:** Toast notifications and feedback components often default to `div`s, which are invisible to screen readers. For users with visual impairments, this means they may not know if an action succeeded or failed.
**Action:** Always assign `role="alert"` (for errors) or `role="status"` (for success) to feedback containers, and ensure they have `aria-live` attributes.
