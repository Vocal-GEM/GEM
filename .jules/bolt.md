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
**Action:** Run `npm run build` before committing to catch syntax errors. Consider adding a pre-commit hook to prevent broken code from being merged.

## 2026-01-24 - Implemented Onset Quality Analysis
**Learning:** The QuadCoreAnalysisService had a TODO for analyzing onset quality (hard vs soft attacks). Hard onsets (glottal attacks) can strain vocal cords over time.
**Action:** Add warning feedback for hard onsets detected within 500ms: "Try starting with a gentle 'h' sound before the vowel."

## 2026-01-24 - Fixed Test Infrastructure
**Learning:** Test files also had merge conflict artifacts, plus the lucide-react mock was missing many icons (Briefcase, Brain, Award, etc.) causing test failures.
**Action:** Mock icons in testing files properly to prevent UI rendering errors.

## 2026-01-25 - Extracted standalone requestAnimationFrame to RenderCoordinator
**Learning:** Using `requestAnimationFrame` standalone in components circumvents the centralized `RenderCoordinator` service, leading to multiple detached animation loops running concurrently. This causes excessive CPU usage and layout thrashing, particularly when fallback views (like `SafeModeVisualizer` in `DynamicOrb.jsx`) are rendered.
**Action:** Always replace direct `requestAnimationFrame(loop)` calls with `renderCoordinator.subscribe(id, loop, priority)` to consolidate rendering into a single, managed loop.
