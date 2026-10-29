## 2024-05-19 - Missing ARIA Labels on Close Buttons
**Learning:** Found an accessibility issue pattern where icon-only buttons (like `X` from lucide-react) for closing modals/overlays (e.g., in `FeedbackModal.jsx`) lack `aria-label` attributes. This prevents screen reader users from understanding the purpose of the button.
**Action:** Add `aria-label="Close"` to these buttons to improve accessibility and ensure they are recognizable by screen readers.
