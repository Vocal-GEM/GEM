## 2025-05-20 - PitchVisualizer Loop Optimization
**Learning:** `Math.log2` is expensive when called thousands of times per second in a render loop. Pre-calculating thresholds based on constants (like `2^(-50/1200)`) allows replacing logarithmic comparisons with simple linear comparisons.
**Action:** When optimizing loop conditions that involve logarithms or other expensive functions, check if the boundaries can be pre-calculated as constants or outside the loop.
