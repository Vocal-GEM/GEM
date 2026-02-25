## 2024-05-23 - Toast Interaction
**Learning:** Users need time to read long toast messages, especially if they contain error details or actionable info. The default "disappear after 3s" behavior is frustrating if the user is actively trying to read it.
**Action:** Implemented pause-on-hover/focus for the `Toast` component. When implementing this, ensure parent components delegate the dismissal logic to the `Toast` component (via `onClose` callback) rather than setting their own `setTimeout`, which would override the pause behavior.

## 2024-05-23 - Vitest Environment Globals
**Learning:** `global` is not reliably defined in all Vitest environments (especially with newer Node/JSDOM versions). Using `globalThis` is the standard, environment-agnostic way to access the global scope in tests.
**Action:** Replaced `global.ResizeObserver` and `global.requestAnimationFrame` with `globalThis.ResizeObserver` and `globalThis.requestAnimationFrame` in test setup files.

## 2024-05-23 - React Component Display Names in Tests
**Learning:** When mocking React components (especially with `lucide-react` icons) in tests, ESLint's `react/display-name` rule can flag anonymous components returned by factory functions.
**Action:** Explicitly assign `Icon.displayName = name` when creating mock components in test files to satisfy linting rules and improve debugging output.
