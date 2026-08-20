## 2026-08-20 - Added ARIA labels and focus states to mobile toggle in Sidebar
**Learning:** The mobile sidebar toggle button in 'Sidebar.jsx' lacked an 'aria-label' and 'aria-expanded' attributes, as well as focus visible rings, which is a common pattern for icon-only buttons in mobile views that affects screen reader users.
**Action:** Always add 'aria-label', 'aria-expanded', and 'focus-visible' utility classes to mobile navigation toggles.
