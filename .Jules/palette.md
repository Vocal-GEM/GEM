## 2024-05-23 - Accessibility Patterns in UI Library
**Learning:** Many core UI components (like Toast, LoadingSpinner) in this custom library are missing fundamental accessibility attributes (ARIA roles, labels, live regions), indicating a pattern of "visual-only" component design that needs systematic review.
**Action:** When touching any UI component (`src/components/ui/`), proactively check for and add missing ARIA attributes (role, aria-label, aria-live) even if not explicitly requested, as the baseline accessibility is low.
