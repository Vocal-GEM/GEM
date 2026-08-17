## 2025-01-28 - RenderCoordinator Refactoring
**Learning:** This codebase uses a custom `RenderCoordinator` singleton service to batch and manage `requestAnimationFrame` calls globally across the app to reduce CPU usage. Standalone `requestAnimationFrame` loops in components should be refactored to subscribe to this service instead of calling RAF directly.
**Action:** When finding a component using a raw `requestAnimationFrame` loop, use `useId()` to generate a unique `vizId`, and pass the loop function to `renderCoordinator.subscribe(vizId, loop, renderCoordinator.PRIORITY.CRITICAL)`.
