## 2025-06-17 - Add ARIA label to icon-only buttons
**Learning:** Found an accessibility issue where the Info icon button in `BrightnessMeter.jsx` lacked an accessible name, making it inaccessible to screen readers.
**Action:** Added `aria-label="More info about Brightness Meter"` to the button to ensure proper screen reader navigation. This pattern should be applied across the app for any icon-only buttons.
