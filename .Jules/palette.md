## 2024-05-23 - Toast Interaction
**Learning:** Users need time to read long toast messages, especially if they contain error details or actionable info. The default "disappear after 3s" behavior is frustrating if the user is actively trying to read it.
**Action:** Implemented pause-on-hover/focus for the `Toast` component. When implementing this, ensure parent components delegate the dismissal logic to the `Toast` component (via `onClose` callback) rather than setting their own `setTimeout`, which would override the pause behavior.
