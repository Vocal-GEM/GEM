## 2024-05-18 - Avoid ARIA Label Overrides
**Learning:** Adding an \`aria-label\` to a button that contains visible dynamic text (like an upvote count) will completely override the text content for screen readers, hiding the dynamic value and causing a major accessibility regression.
**Action:** When adding \`aria-label\` to buttons with partial visible text, ensure the dynamic text is interpolated into the label (e.g., \`aria-label={"Upvote. Current upvotes: " + count}\`) or use screen-reader-only (\`sr-only\`) span classes instead of a full \`aria-label\` override.
