## 2025-02-18 - Duplicate Attributes from Merge Conflicts
**Learning:** Merge conflicts can result in duplicated `className` and accessibility attributes on the same element. React renders this without error (taking the last one), but it can lead to broken styles and confused accessibility trees (e.g. lost `aria-` states).
**Action:** Always check for duplicate attributes on elements when cleaning up components, and use `twMerge` to consolidate conditional classes safely.
