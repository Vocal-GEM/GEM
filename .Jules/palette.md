## 2024-05-23 - Critical Feedback Accessibility
**Learning:** Toast notifications and feedback components often default to `div`s, which are invisible to screen readers. For users with visual impairments, this means they may not know if an action succeeded or failed.
**Action:** Always assign `role="alert"` (for errors) or `role="status"` (for success) to feedback containers, and ensure they have `aria-live` attributes.
# Palette's Journal

## 2025-02-18 - Toast Accessibility Improvements
**Learning:** Toast notifications often lack semantic roles (`role="alert"` vs `role="status"`), causing screen readers to miss critical feedback or annoy users with low-priority updates.
**Action:** Always map toast severity to appropriate ARIA roles and ensure close buttons have explicit labels.
## 2024-05-23 - Accessibility Improvements
**Learning:** Toast components often misuse `role="alert"` for all messages. Differentiating between `status` (polite) and `alert` (assertive) based on message type (success vs error) significantly improves the screen reader experience by not interrupting users for non-critical updates.
**Action:** When implementing toast/notification systems, always dynamically set ARIA roles based on the severity of the content.
