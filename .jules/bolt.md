## 2025-05-23 - RenderCoordinator Pattern
**Learning:** Visualization components in this codebase are designed to share a single requestAnimationFrame loop via `RenderCoordinator`.
**Action:** When working on visualization components, always check if they implement `RenderCoordinator`. If they use `requestAnimationFrame` directly, refactor them to use `renderCoordinator.subscribe`. This prevents multiple loops fighting for resources and allows for centralized performance management (throttling, prioritization).
