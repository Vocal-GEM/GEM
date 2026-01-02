## 2024-05-23 - Accessibility Patterns in UI Library
**Learning:** Many core UI components (like Toast, LoadingSpinner) in this custom library are missing fundamental accessibility attributes (ARIA roles, labels, live regions), indicating a pattern of "visual-only" component design that needs systematic review.
**Action:** When touching any UI component (`src/components/ui/`), proactively check for and add missing ARIA attributes (role, aria-label, aria-live) even if not explicitly requested, as the baseline accessibility is low.
## 2024-05-23 - Accessibility of Purely Visual Indicators
**Learning:** Purely visual indicators like loading spinners are often invisible to screen readers, causing confusion about the app's state.
**Action:** Always add `role="status"` and `aria-label` or visually hidden text to visual-only status indicators.
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
