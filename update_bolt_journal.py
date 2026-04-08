import re

journal_path = '.jules/bolt.md'
with open(journal_path, 'r') as f:
    content = f.read()

new_entry = """
## 2026-01-24 - RenderCoordinator Fork Bombs
**Learning:** Components subscribing to a centralized render loop (like `RenderCoordinator`) must not call `requestAnimationFrame` inside their subscribed callback. Doing so creates an exponential "fork bomb" of render loops that ignores cleanup and crashes performance.
**Action:** When migrating to a centralized coordinator, strictly audit the callback to ensure all raw RAF calls are removed. Additionally, always use an `isMounted` flag when dynamically importing the coordinator to prevent zombie subscriptions.
"""

if "Fork Bombs" not in content:
    with open(journal_path, 'a') as f:
        f.write(new_entry)
        print("Updated .jules/bolt.md")
else:
    print("Entry already exists.")
