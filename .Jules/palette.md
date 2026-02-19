## 2026-02-19 - Accessibility: Missing ARIA Labels on Icon-Only Buttons
**Learning:** Many icon-only buttons (using `size="icon"` or raw `<button><Icon /></button>`) lack `aria-label` attributes, making them inaccessible to screen readers. This pattern is prevalent in modals and overlays.
**Action:** Always verify that buttons containing only icons (e.g., Close, Zoom, Play/Pause) have a descriptive `aria-label`. For dynamic states (like Play/Pause), use a ternary operator to update the label.
