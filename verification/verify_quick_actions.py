from playwright.sync_api import sync_playwright, expect

def verify_quick_actions():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app
        print("Navigating to app...")
        page.goto("http://localhost:3000/")

        # Wait for app to load (checking for sidebar or main content)
        print("Waiting for app to load...")
        page.wait_for_selector("main#main-content", timeout=10000)

        # Verify Quick Actions FAB is present
        print("Looking for Quick Actions button...")
        fab = page.get_by_label("Open Quick Actions")
        expect(fab).to_be_visible()

        # Click the FAB
        print("Clicking Quick Actions button...")
        fab.click()

        # Wait for menu to open (check for Practice button)
        print("Waiting for menu to open...")
        practice_btn = page.get_by_role("button", name="Practice")
        expect(practice_btn).to_be_visible()

        # Take screenshot
        print("Taking screenshot...")
        page.screenshot(path="verification_quick_actions.png")

        browser.close()
        print("Verification complete!")

if __name__ == "__main__":
    verify_quick_actions()
