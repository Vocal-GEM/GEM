from playwright.sync_api import sync_playwright

def verify_quick_actions():
    with sync_playwright() as p:
        print("Launching browser...")
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1280, 'height': 720}
        )
        page = context.new_page()

        print("Navigating to app...")
        try:
            page.goto("http://localhost:3000")
        except Exception as e:
            print(f"Error navigating: {e}")
            browser.close()
            return

        # Wait for the app to load - wait for something unique on the page or just a timeout
        # I'll wait for the FAB specifically
        print("Waiting for Quick Actions button...")
        try:
            fab = page.wait_for_selector('button[aria-label="Open Quick Actions"]', timeout=10000)
        except Exception as e:
            print(f"FAB not found: {e}")
            page.screenshot(path="verification/debug_fab_missing.png")
            browser.close()
            return

        if not fab.is_visible():
            print("FAB not found or not visible!")
            page.screenshot(path="verification/debug_fab_missing.png")
            browser.close()
            return

        print("Clicking FAB...")
        fab.click()

        # Wait for menu animation
        page.wait_for_timeout(1000)

        # Verify menu items are visible
        # We look for "Practice" label which is in a span inside the button
        # The button has aria-label="Practice"
        try:
            practice_btn = page.wait_for_selector('button[aria-label="Practice"]', timeout=5000)

            if practice_btn.is_visible():
                print("Quick Actions menu opened successfully!")
            else:
                print("Quick Actions menu items not visible!")
        except Exception as e:
             print(f"Practice button not found: {e}")

        # Take screenshot
        print("Taking screenshot...")
        page.screenshot(path="verification/quick_actions_open.png")

        browser.close()

if __name__ == "__main__":
    verify_quick_actions()
