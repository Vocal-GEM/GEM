## 2024-10-24 - Navigation Testing & Strict Mode
**Learning:** Playwright verification scripts often fail on 'nav' elements due to strict mode violations when both Sidebar and Breadcrumbs are present.
**Action:** Always assign distinct 'aria-label' attributes to navigation regions (e.g., 'Breadcrumb', 'Main Navigation') and use specific locators like 'page.locator("nav[aria-label='Breadcrumb']")' instead of generic roles.
