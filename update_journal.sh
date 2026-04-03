#!/bin/bash
cat << 'INNER_EOF' >> .jules/palette.md
## 2024-05-25 - Ensuring ARIA labels on Icon-only UI Controls
**Learning:** Icon-only buttons used in interactive visualizations often lack text labels or `aria-label`s, rendering them completely inaccessible or confusing to screen reader users who only hear "button".
**Action:** Systematically add `aria-label` attributes to any `<button>` element that only contains an icon (e.g., SVG components like `<History />` or `<Volume2 />`).
INNER_EOF
