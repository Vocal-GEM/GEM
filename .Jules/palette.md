## 2024-05-23 - Accessible Loading States
**Learning:** Foundational components like `LoadingSpinner` are often used as generic `Suspense` fallbacks without accessibility attributes, creating "silent" waiting periods for screen reader users.
**Action:** When creating or auditing loading components, always include `role="status"` and a visually hidden label. Defaulting to `aria-live="polite"` prevents announcements from interrupting the user but ensures they are aware of the state change.
