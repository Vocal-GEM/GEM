## 2026-05-14 - Layout Thrashing in Animation Loops
**Learning:** `getBoundingClientRect()` causes a synchronous reflow (layout thrashing) when called inside high-frequency event handlers. In `Spectrogram.jsx` and `FileSpectrogram.jsx`, this was being called frequently, which forces a full repaint.
**Action:** Use `ResizeObserver` to track element dimensions asynchronously. Update the canvas size only when the physical dimensions actually change, and store the dimensions in a `ref` for use in the animation loop and event handlers.
