## YYYY-MM-DD - HighResSpectrogram Optimization
**Learning:** React memoization combined with caching `colormap` and reusing typed arrays (`Uint32Array`) and `ImageData` is vital for performant Canvas loops in React. We also must ensure that we never generate new typed arrays dynamically within an animation loop since that triggers aggressive garbage collection that drops frames.
**Action:** Apply the same optimizations seen in `HighResSpectrogram` and `Spectrogram` when building high-performance visualizers.

## 2025-03-29 - Replace recursive requestAnimationFrame with RenderCoordinator
**Learning:** Using direct, recursive `requestAnimationFrame` calls within individual components causes excessive CPU usage and potential layout thrashing when many visualizations run simultaneously.
**Action:** Replace `requestAnimationFrame` and `cancelAnimationFrame` inside component `useEffect` hooks with `renderCoordinator.subscribe` and its returned unsubscribe function to offload management to a centralized loop.
