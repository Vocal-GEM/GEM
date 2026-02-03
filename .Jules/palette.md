## 2024-05-23 - Broken Component Hygiene
**Learning:** Found critical UI components (`QuickActions`) containing duplicate attributes and invalid HTML nesting, likely due to resolved merge conflicts or copy-paste errors. This resulted in broken accessibility tree and potentially unpredictable rendering.
**Action:** When touching any UI file, scan for duplicate `className` props or unclosed tags. Use `twMerge` to consolidate conflicting classes instead of leaving duplicates.

## 2024-05-23 - Accessibility of Hidden Elements
**Learning:** Floating Action Buttons (FABs) often have hidden labels. Relying solely on `title` or `aria-label` is good, but visual tooltips or labels that appear on focus/hover (like in `QuickActions`) provide better UX for keyboard users.
**Action:** Ensure that icon-only buttons reveal their text labels on `focus-visible` as well as hover, so keyboard users know what the action does.
