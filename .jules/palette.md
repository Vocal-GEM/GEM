## 2024-06-25 - Custom Tooltip Accessibility
**Learning:** Custom tooltips on interactive elements (like InfoTooltip) must be keyboard accessible. A standard div with `onMouseEnter` is invisible to screen readers and keyboard users. Using a native `<button>` element provides built-in focus management and keyboard activation.
**Action:** Pair `onMouseEnter`/`onMouseLeave` with `onFocus`/`onBlur` for custom tooltips, add `aria-label` or `aria-expanded`, and use semantic `<button>` elements for interactive triggers. Ensure focus styles are visible.
## 2024-06-25 - Custom Tooltip Accessibility
**Learning:** Custom tooltips on interactive elements (like InfoTooltip) must be keyboard accessible. A standard div with `onMouseEnter` is invisible to screen readers and keyboard users.
**Action:** Always pair `onMouseEnter`/`onMouseLeave` with `onFocus`/`onBlur`, add `aria-label` or `aria-expanded`, use semantic `<button>` elements, and apply `focus-visible` styles for custom tooltips.
