## 2024-05-22 - Command Palette Accessibility
**Learning:** Global keyboard shortcuts (like Cmd+K) are essential for accessibility but often missed in component-centric designs where the component manages its own visibility.
**Action:** When designing global overlays, ensure the keyboard listener is active even when the overlay is visually hidden, or lift the listener to a global context/layout.
