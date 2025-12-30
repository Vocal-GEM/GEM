# Palette's Journal

## 2025-02-18 - Toast Accessibility Improvements
**Learning:** Toast notifications often lack semantic roles (`role="alert"` vs `role="status"`), causing screen readers to miss critical feedback or annoy users with low-priority updates.
**Action:** Always map toast severity to appropriate ARIA roles and ensure close buttons have explicit labels.
