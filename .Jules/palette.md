## 2026-02-12 - Accessible Icon Buttons in Lists
**Learning:** Icon-only buttons in dynamic lists (like play/delete/edit actions) are frequently missed accessibility targets. Without `aria-label` and `focus-visible` styles, they are invisible to screen readers and difficult to navigate via keyboard.
**Action:** When auditing list components, specifically hunt for mapped icon buttons and verify they have unique accessible names (e.g., "Play recording" vs "Play") and visible focus rings.
