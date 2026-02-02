
## 2024-05-22 - Visual hints without implementation (The Cmd+K illusion)
**Learning:** The Sidebar displayed a "Cmd+K" visual hint for search, but the functionality was missing. This creates a frustration gap where the UI promises a power-user feature it doesn't support.
**Action:** Always verify that visual shortcuts (icons, hints, tooltips) have corresponding event listeners.

## 2024-05-23 - Accessibility First Refactoring
**Learning:** A seemingly simple request to "fix linting errors" revealed deep accessibility issues (missing ARIA labels, unescaped characters breaking screen readers, keyboard traps). Fixing these at the linting level forced a review of the component's semantic structure.
**Action:** Treat linting errors in JSX (like `jsx-a11y`) not just as style nits, but as indicators of potential usability barriers. When fixing unescaped entities, also check if the surrounding text is meaningful to assistive technology.
