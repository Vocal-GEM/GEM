## 2025-06-17 - Centralizing SafeModeVisualizer Animation Loop
**Learning:** Found a component (`SafeModeVisualizer` within `DynamicOrb.jsx`) using a raw `requestAnimationFrame` loop despite the project architecture strictly defining a `RenderCoordinator` singleton. This causes multiple independent loops and layout thrashing, hurting performance.
**Action:** Always verify nested or fallback components to ensure they adhere to central architectural performance guidelines (like `RenderCoordinator`) rather than just the primary rendering path.

## 2025-06-17 - Centralizing SafeModeVisualizer Animation Loop
**Learning:** Found a component (`SafeModeVisualizer` within `DynamicOrb.jsx`) using a raw `requestAnimationFrame` loop despite the project architecture strictly defining a `RenderCoordinator` singleton. This causes multiple independent loops and layout thrashing, hurting performance.
**Action:** Always verify nested or fallback components to ensure they adhere to central architectural performance guidelines (like `RenderCoordinator`) rather than just the primary rendering path.
