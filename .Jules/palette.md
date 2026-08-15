## 2025-02-12 - Floating Camera Controls Accessibility
**Learning:** Icon-only buttons (often using `lucide-react`) frequently lack `aria-label` attributes and keyboard focus indicators, making tools like floating video streams inaccessible to screen readers and difficult to navigate without a mouse.
**Action:** When creating or fixing overlay UI components with icon-only buttons, always manually add `aria-label`s and clear visual focus rings (e.g., `focus:outline-none focus-visible:ring-2`) to ensure full keyboard and screen reader accessibility.
