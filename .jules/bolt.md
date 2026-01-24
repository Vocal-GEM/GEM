# BOLT'S JOURNAL - CRITICAL LEARNINGS ONLY

## 2025-05-21 - React Audio instantiation anti-pattern
**Learning:** Multiple components were using `const audioRef = useRef(new Audio())`. This constructor runs on *every render*, creating detached DOM elements that are immediately discarded by React's hook reconciliation, causing significant memory churn and CPU overhead.
**Action:** Always use `useRef(null)` combined with `useEffect` for lazy initialization of expensive objects like `Audio`, `Worker`, or `MediaRecorder`.

## 2025-05-21 - Widespread Lazy Initialization Anti-Pattern
**Learning:** The `useRef(new Class())` anti-pattern was found in 7+ components, involving `Float32Array` buffers (up to 16KB per render in `Spectrogram3D`), `Image` objects, and service classes. This creates invisible memory pressure that doesn't break functionality but triggers frequent GC pauses.
**Action:** Audit all `useRef` calls during code reviews. Any `new` keyword inside `useRef(...)` is a red flag. Use `if (!ref.current) ref.current = new Class()` for strict lazy loading.
