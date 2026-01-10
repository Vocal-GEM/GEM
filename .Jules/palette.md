## 2024-05-24 - File Integrity and Accessibility
**Learning:** Merge conflicts or copy-paste errors in foundational components (like `LoadingSpinner`) can lead to malformed code that might technically render but fail silently or be completely inaccessible.
**Action:** When fixing "broken" components, treat it as an opportunity to audit and enforce accessibility standards (roles, labels) during the reconstruction, rather than just restoring the previous (potentially flawed) state.
## 2024-05-22 - QuickActions Accessibility & Build Stabilization
**Learning:** Invisible elements (opacity: 0) remain in the accessibility tree, confusing screen reader users. `pointer-events: none` does not prevent keyboard focus in all contexts.
**Action:** Use `aria-hidden="true"` and `tabIndex={-1}` for visually hidden interactive elements, or `visibility: hidden` if layout allows.
