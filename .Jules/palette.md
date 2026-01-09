## 2024-05-22 - QuickActions Accessibility & Build Stabilization
**Learning:** Invisible elements (opacity: 0) remain in the accessibility tree, confusing screen reader users. `pointer-events: none` does not prevent keyboard focus in all contexts.
**Action:** Use `aria-hidden="true"` and `tabIndex={-1}` for visually hidden interactive elements, or `visibility: hidden` if layout allows.
