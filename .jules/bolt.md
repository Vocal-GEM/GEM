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

## 2026-01-24 - Fixed Merge Conflict Artifacts Across Codebase
**Learning:** Multiple files had unresolved merge conflict artifacts causing duplicate imports, duplicate variable declarations, and broken JSX. These went undetected until build time because ESLint doesn't catch duplicate `const` declarations at runtime.
**Files Fixed:**
- `VoiceQualityAnalysis.jsx` - duplicate imports and service refs
- `PitchVisualizer.jsx` - duplicate Image refs and balloonRef/birdRef declarations
- `Toast.jsx` - duplicate style definitions and JSX elements
- `LoadingSpinner.jsx` - multiple conflicting implementations
- `button.jsx` - duplicate component definitions
- `VoiceQualityMeter.jsx` - duplicate useCallback closing
- `BrightnessMeter.jsx` - duplicate imports and useEffect closings
- `FeedbackManager.jsx` - duplicate adaptiveController refs
- `LTASPlot.jsx` - duplicate accumulatorRef declarations
**Action:** Run `npm run build` before committing to catch syntax errors. Consider adding a pre-commit hook to prevent broken code from being merged.

## 2026-01-24 - Implemented Onset Quality Analysis
**Learning:** The QuadCoreAnalysisService had a TODO for analyzing onset quality (hard vs soft attacks). Hard onsets (glottal attacks) can strain vocal cords over time.
**Implementation:** Added `analyzeOnsetQuality()` method that tracks volume history and calculates the maximum slope during phonation onset. Thresholds: >0.15 = hard, <0.03 = soft, otherwise balanced.
**Feedback:** Added warning feedback for hard onsets detected within 500ms: "Try starting with a gentle 'h' sound before the vowel."

## 2026-01-24 - Fixed Test Infrastructure
**Learning:** Test files also had merge conflict artifacts, plus the lucide-react mock was missing many icons (Briefcase, Brain, Award, etc.) causing test failures.
**Files Fixed:**
- `BreathinessMeter.test.jsx` - duplicate imports and mocks
- `Toast.test.jsx` - duplicate describe blocks
- `HighResSpectrogram.test.jsx` - duplicate imports
- `QualityVisualizer.test.jsx` - duplicate mocks
- `ResonanceMetrics.test.jsx` - duplicate test blocks
- `src/test/setup.jsx` - added ~80 missing lucide-react icon mocks
- `ResonanceMetrics.jsx` - missing `useRef` import (caught by tests)
**Result:** Test suite improved from 14 failing to 11 failing (residual failures are unrelated to merge conflicts).
## 2024-05-17 - Canvas Dimension Reassignment in requestAnimationFrame
**Learning:** Reassigning `canvas.width` or `canvas.height` inside a `requestAnimationFrame` loop (even if the values haven't changed logically from the developer's perspective) forces the browser to synchronously clear the canvas drawing buffer and reset the context state (including transforms like `ctx.scale`). This causes severe layout thrashing and performance degradation, turning a simple render loop into a major CPU bottleneck.
**Action:** Always cache logical canvas dimensions using a `ResizeObserver` on the canvas element. Update the physical `canvas.width` and `canvas.height` only within the `ResizeObserver` callback. Inside the render loop, rely on the cached dimensions to determine drawing boundaries, and explicitly clear the canvas (`ctx.clearRect`) instead of relying on the implicit dimension-reassignment clear. Use `ctx.save()` and `ctx.restore()` if global transforms are applied.
