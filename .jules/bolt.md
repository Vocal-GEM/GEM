# BOLT'S JOURNAL - CRITICAL LEARNINGS ONLY

## 2025-05-21 - React Audio instantiation anti-pattern
**Learning:** Multiple components were using `const audioRef = useRef(new Audio())`. This constructor runs on *every render*, creating detached DOM elements that are immediately discarded by React's hook reconciliation, causing significant memory churn and CPU overhead.
**Action:** Always use `useRef(null)` combined with `useEffect` for lazy initialization of expensive objects like `Audio`, `Worker`, or `MediaRecorder`.

## 2025-05-21 - Layout Thrashing in Animation Loops
**Learning:** `PitchOrb.jsx` called `getBoundingClientRect()` inside the `requestAnimationFrame` loop. This forces the browser to recalculate layout styles synchronously on every frame (60fps), even if dimensions haven't changed, causing significant CPU usage and frame drops.
**Action:** Use `ResizeObserver` to cache element dimensions and only update them when the element actually resizes. Read from cached values in the animation loop.
