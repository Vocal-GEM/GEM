## 2026-01-14 - Dynamic ARIA labels for Stateful Toggle Buttons
**Learning:** Found that the main mobile toggle button for the Sidebar (`<button onClick={() => setIsOpen(!isOpen)}>`) was missing an `aria-label`. Moreover, since it toggles the sidebar, the `aria-label` shouldn't be static, but rather dynamic based on state (e.g. `aria-label={isOpen ? 'Close menu' : 'Open menu'}`).
**Action:** Always ensure toggle buttons that change application state have a dynamic `aria-label` describing the *action* that will happen upon clicking, not just their current state.
