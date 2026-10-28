## 2024-10-28 - Missing ARIA label on VoiceFingerprint Refresh Button
**Learning:** Found a pattern of icon-only buttons missing `aria-label` attributes. The refresh button in the VoiceFingerprint component only contained an icon (`<RefreshCw />`) but had no screen reader text. This is a common accessibility regression in dashboards with dense icon actions.
**Action:** Added `aria-label="Refresh data"` to ensure screen reader users can understand the button's purpose. I will watch out for similar icon-only buttons across the UI.
