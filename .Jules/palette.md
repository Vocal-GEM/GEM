# Palette's Journal

This journal records critical UX and accessibility learnings.

## 2025-05-18 - Merge Conflicts in UI Components
**Learning:** Duplicate attributes and nested logic caused by merge conflicts can silently break accessibility and rendering without crashing the build, until runtime or rigorous testing.
**Action:** When inspecting UI components, check for duplicated props (especially `className` and `aria-*`) which indicate unresolved merge conflicts.
