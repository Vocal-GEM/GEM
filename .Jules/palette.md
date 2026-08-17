## 2024-03-24 - Accessibility improvements in React Sidebar
**Learning:** Found an icon-only menu button in the mobile responsive wrapper of Sidebar.jsx that lacked an `aria-label` or focus outline styles, making it invisible to screen readers and difficult to navigate with a keyboard.
**Action:** When implementing mobile toggle buttons, explicitly add `aria-label="Open menu"` (or dynamic labels) and ensure keyboard focus visibility via Tailwind's `focus:outline-none focus-visible:ring-2` to meet standard A11y criteria.
