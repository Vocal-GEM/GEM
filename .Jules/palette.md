## 2024-10-25 - Missing ARIA Labels on Info/Tooltip Buttons
**Learning:** Found an accessibility pattern where `<button>` elements containing only an `<Info />` icon for tooltips lack `aria-label` attributes. This makes them invisible to screen readers, preventing visually impaired users from accessing the explanatory tooltips attached to complex UI visualizations.
**Action:** Always add descriptive `aria-label` attributes (e.g., `aria-label="Show [Component] information"`) to icon-only tooltip trigger buttons.
