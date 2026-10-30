## 2024-10-30 - Missing ARIA Labels on Icon Buttons in ShadowingExercise
**Learning:** Found multiple icon-only buttons (like back/close arrows) missing `aria-label`s in `ShadowingExercise.jsx`. This makes it difficult for screen reader users to navigate the shadowing flow.
**Action:** Always verify icon-only buttons have descriptive `aria-label`s, especially in multi-step exercise components.
## 2024-10-30 - More Missing ARIA Labels on Icon Buttons
**Learning:** Found more icon-only buttons missing `aria-label`s in `ClientDashboard.jsx` (options menu) and `SpectrogramComparison.jsx` (zoom controls). This pattern indicates a systemic issue with custom buttons.
**Action:** When creating icon-only buttons outside of the standard `Button` component, explicitly add `aria-label`s to ensure they are accessible.
