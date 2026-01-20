# BOLT'S JOURNAL - CRITICAL LEARNINGS ONLY

## 2025-05-21 - React Audio instantiation anti-pattern
**Learning:** Multiple components were using `const audioRef = useRef(new Audio())`. This constructor runs on *every render*, creating detached DOM elements that are immediately discarded by React's hook reconciliation, causing significant memory churn and CPU overhead.
**Action:** Always use `useRef(null)` combined with `useEffect` for lazy initialization of expensive objects like `Audio`, `Worker`, or `MediaRecorder`.

## 2025-05-21 - State Updates in RenderCoordinator Loop
**Learning:** Components subscribing to `RenderCoordinator` were updating React state (e.g., `useState`) inside the animation loop callback. This defeats the purpose of the coordinator by triggering full React re-renders/reconciliation at 60fps.
**Action:** In `RenderCoordinator` callbacks, use `useRef` and direct DOM manipulation for high-frequency updates (e.g., `ref.current.style.left`, `ref.current.innerText`). Only use state for low-frequency structural changes.
