## 2024-05-23 - Accessibility of Purely Visual Indicators
**Learning:** Purely visual indicators like loading spinners are often invisible to screen readers, causing confusion about the app's state.
**Action:** Always add `role="status"` and `aria-label` or visually hidden text to visual-only status indicators.
