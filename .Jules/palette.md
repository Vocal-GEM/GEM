## 2024-05-18 - Missing ARIA Labels on Icon-only Buttons
**Learning:** Found multiple icon-only buttons across visualizations (Spectrogram, HighResSpectrogram) missing `aria-label` attributes. This breaks accessibility for screen readers navigating these highly technical interactive visualization components.
**Action:** When adding or reviewing interactive canvas overlays, always verify that close buttons or action icons (e.g. Camera icon for screenshots) contain appropriate `aria-label` properties.
