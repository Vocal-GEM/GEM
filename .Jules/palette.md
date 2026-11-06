## 2026-11-06 - Dynamic ARIA labels for stateful toggles
**Learning:** For stateful icon-only toggle buttons (like mobile hamburger menus), using a dynamic `aria-label` based on state (e.g., "Open menu" vs "Close menu") provides much clearer context to screen reader users than a static label.
**Action:** Always evaluate if an icon-only button toggles a state, and if so, apply a state-dependent dynamic `aria-label`.
