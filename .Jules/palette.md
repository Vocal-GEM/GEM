## 2025-02-12 - Interactive Div Pattern
**Learning:** Found an `InfoTooltip` component using a clickable `div` instead of a semantic `<button>`, making it inaccessible to keyboard users and screen readers.
**Action:** Always replace interactive `div`s with `<button>` elements and ensure proper ARIA attributes (`aria-label`, `aria-describedby`) and keyboard handlers are present.
