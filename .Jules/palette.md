## 2024-05-23 - Accessible Loading States
**Learning:** Foundational components like `LoadingSpinner` are often used as generic `Suspense` fallbacks without accessibility attributes, creating "silent" waiting periods for screen reader users.
**Action:** When creating or auditing loading components, always include `role="status"` and a visually hidden label. Defaulting to `aria-live="polite"` prevents announcements from interrupting the user but ensures they are aware of the state change.
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
## 2024-05-24 - Flexible Loading Component
**Learning:** Hardcoding dimensions (like `min-h-[200px]`) in generic loading components restricts their reuse in smaller contexts (like buttons), leading to code duplication or hacky overrides.
**Action:** Use `tailwind-merge` to provide sensible defaults but allow full overrides via `className`, enabling a single component to serve both full-page and inline loading needs.
## 2026-01-03 - Component Corruption
**Learning:** Multiple conflicting definitions within a single component file (likely from bad merges) can go unnoticed if the file exports the last definition, but it creates a maintainability nightmare and breaks tools.
**Action:** Always check the entire file content when fixing a component, not just the function you are editing, to spot and clean up duplicate/conflicting code blocks.
