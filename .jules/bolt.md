# BOLT'S JOURNAL - CRITICAL LEARNINGS ONLY

## 2025-05-21 - React Audio instantiation anti-pattern
**Learning:** Multiple components were using `const audioRef = useRef(new Audio())`. This constructor runs on *every render*, creating detached DOM elements that are immediately discarded by React's hook reconciliation, causing significant memory churn and CPU overhead.
**Action:** Always use `useRef(null)` combined with `useEffect` for lazy initialization of expensive objects like `Audio`, `Worker`, or `MediaRecorder`.

## 2025-05-22 - Throttle State Updates in RAF Loops
**Learning:** `PitchVisualizer` was calling `setAveragePitchRange` inside a Request Animation Frame loop. Even though `setAveragePitchRange` triggers a re-render, doing it 60 times a second (or more) kills performance and causes unnecessary reconciliation overhead.
**Action:** Use refs for high-frequency data accumulation and throttle state updates (e.g., using `setTimeout` or `Date.now()` check) to a reasonable frame rate for UI (e.g., 10fps) when updating React state from a render loop.
