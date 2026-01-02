## 2024-05-23 - Accessibility Improvements
**Learning:** Toast components often misuse `role="alert"` for all messages. Differentiating between `status` (polite) and `alert` (assertive) based on message type (success vs error) significantly improves the screen reader experience by not interrupting users for non-critical updates.
**Action:** When implementing toast/notification systems, always dynamically set ARIA roles based on the severity of the content.
