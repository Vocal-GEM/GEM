## 2024-05-19 - Mobile Navigation Menu Accessibility
**Learning:** Found an icon-only button used to toggle the mobile sidebar navigation without an `aria-label`. This makes the navigation menu completely invisible to screen readers, causing a severe accessibility regression for visually impaired users.
**Action:** Always ensure that icon-only interactive elements, especially those critical to site navigation like hamburger menus, have descriptive `aria-label` attributes (e.g., `aria-label="Open mobile menu"`) that dynamically update based on state (e.g., "Close mobile menu" when open).
