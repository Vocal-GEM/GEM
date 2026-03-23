## 2024-03-23 - Accessibility of Dynamic UI Lists
**Learning:** Icon-only buttons used in dynamically generated lists (like `RecordingsList`) often lack context for screen readers if static aria-labels are used.
**Action:** When adding `aria-label` to list items, template the label to include unique identifiers like the item's name (e.g., `aria-label={\`Play recording ${recording.name}\`}`) to provide necessary context to assistive technologies.
