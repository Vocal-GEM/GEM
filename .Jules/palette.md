## 2024-11-03 - Icon-Only Buttons Accessibility
**Learning:** Found a widespread pattern across many components (Sidebar, VocalHealthTips, ExportPanel, DynamicOrb, ShadowingExercise, etc.) where icon-only buttons lacked `aria-label` attributes. This is a significant accessibility gap for screen reader users who wouldn't know the button's purpose.
**Action:** Always verify that icon-only buttons (`<button><Icon/></button>`) have an explicit, descriptive `aria-label` to provide context.
