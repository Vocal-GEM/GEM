## 2024-03-24 - Accessibility improvements for LiveCoachingOverlay
**Learning:** Found that quick action buttons containing only icons and minimal text need explicit aria-labels indicating their action (e.g. "Maximize coaching overlay") rather than just the visible label, and they need focus-visible rings for keyboard navigation as they lacked proper focus indicators in the dark theme.
**Action:** Always verify keyboard focus states and add explicit aria-labels to navigation grid items that use generic visually-focused layouts.
