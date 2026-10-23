## 2024-10-23 - Add ARIA Labels to Icon-Only Buttons
**Learning:** Found several components utilizing icon-only buttons without `aria-label` attributes (e.g., Back and Close buttons in `ShadowingExercise.jsx`, Upvote in `SuccessStories.jsx`). This prevents screen readers from understanding the button's action.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes.
