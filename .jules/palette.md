## 2024-05-23 - Missing ARIA labels on icon-only buttons
**Learning:** Icon-only buttons (especially those using `size="icon"` or raw `<button><Icon /></button>`) consistently lack `aria-label` attributes across the codebase.
**Action:** When creating or modifying icon-only buttons, always enforce `aria-label`. Use `role="switch"` for toggle-like list items to improve semantic meaning.
