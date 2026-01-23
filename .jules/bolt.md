# BOLT'S JOURNAL - CRITICAL LEARNINGS ONLY

## 2025-05-21 - React Audio instantiation anti-pattern
**Learning:** Multiple components were using `const audioRef = useRef(new Audio())`. This constructor runs on *every render*, creating detached DOM elements that are immediately discarded by React's hook reconciliation, causing significant memory churn and CPU overhead.
**Action:** Always use `useRef(null)` combined with `useEffect` for lazy initialization of expensive objects like `Audio`, `Worker`, or `MediaRecorder`.

## 2025-05-21 - Layout Thrashing in Animation Loops
**Learning:** `getBoundingClientRect()` causes a synchronous reflow (layout thrashing) when called inside a high-frequency animation loop (e.g., `requestAnimationFrame`). In `PitchVisualizer.jsx`, this was being called ~60 times per second along with canvas resizing, which forces a full repaint.
**Action:** Use `ResizeObserver` to track element dimensions asynchronously. Update the canvas size only when the physical dimensions actually change, and store the dimensions in a `ref` for use in the animation loop.
