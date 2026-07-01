# VowelAnalysis.jsx Unmanaged requestAnimationFrame removal

1.  **Analyze current code**: The `useEffect` in `src/components/viz/VowelAnalysis.jsx` uses `requestAnimationFrame(loop)` recursively within the `loop` function.
2.  **The Bug**: Simultaneously, the component registers the exact same `loop` function with `renderCoordinator.subscribe(..., loop, ...)`. Since `RenderCoordinator` manages its own animation loop and calls registered functions every frame, the internal `requestAnimationFrame` causes the `loop` to be called exponentially over time, or at least run redundant, unmanaged loops, defeating the purpose of the singleton `RenderCoordinator` and causing CPU bloat.
3.  **The Fix**: Remove the explicit `requestAnimationFrame(loop);` call from `src/components/viz/VowelAnalysis.jsx` so it solely relies on `renderCoordinator` which is already being imported and used right below it.
