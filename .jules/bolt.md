# BOLT'S JOURNAL - CRITICAL LEARNINGS ONLY

## 2025-05-21 - React Audio instantiation anti-pattern
**Learning:** Multiple components were using `const audioRef = useRef(new Audio())`. This constructor runs on *every render*, creating detached DOM elements that are immediately discarded by React's hook reconciliation, causing significant memory churn and CPU overhead.
**Action:** Always use `useRef(null)` combined with `useEffect` for lazy initialization of expensive objects like `Audio`, `Worker`, or `MediaRecorder`.

## 2025-05-21 - Layout Thrashing in Animation Loops
**Learning:** `getBoundingClientRect()` causes a synchronous reflow (layout thrashing) when called inside a high-frequency animation loop (e.g., `requestAnimationFrame`). In `PitchVisualizer.jsx`, this was being called ~60 times per second along with canvas resizing, which forces a full repaint.
**Action:** Use `ResizeObserver` to track element dimensions asynchronously. Update the canvas size only when the physical dimensions actually change, and store the dimensions in a `ref` for use in the animation loop.
## 2025-05-21 - Widespread Lazy Initialization Anti-Pattern
**Learning:** The `useRef(new Class())` anti-pattern was found in 7+ components, involving `Float32Array` buffers (up to 16KB per render in `Spectrogram3D`), `Image` objects, and service classes. This creates invisible memory pressure that doesn't break functionality but triggers frequent GC pauses.
**Action:** Audit all `useRef` calls during code reviews. Any `new` keyword inside `useRef(...)` is a red flag. Use `if (!ref.current) ref.current = new Class()` for strict lazy loading.

## 2025-05-21 - Duplicate Refs and Corrupted Files
**Learning:** Found critical corruption in `PitchVisualizer.jsx` and `FeedbackManager.jsx` where `useRef` declarations were duplicated multiple times, likely due to bad merge conflict resolution. This caused syntax errors and potential performance issues (multiple unnecessary ref objects).
**Action:** When seeing `useRef` at the top of a component, check for duplicates immediately below. Fix by consolidating into single declarations.
