from playwright.sync_api import sync_playwright, expect
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Go to the app
        print("Navigating to app...")
        page.goto("http://localhost:3000")

        # Handle Tour/Setup Skipping
        print("Attempting to dismiss overlays...")
        page.wait_for_timeout(2000)

        try:
            skip_btns = page.get_by_role("button", name="Skip Tour")
            if skip_btns.count() > 0:
                print("Clicking Skip Tour...")
                skip_btns.first.click(force=True)
                page.wait_for_timeout(1000)

            skip_setup = page.get_by_role("button", name="Skip Setup")
            if skip_setup.count() > 0:
                print("Clicking Skip Setup...")
                skip_setup.first.click(force=True)
                page.wait_for_timeout(1000)

        except Exception as e:
            print(f"Note: Skip button handling: {e}")

        # Wait for the Quick Actions region
        print("Waiting for Quick Actions region...")
        region = page.get_by_role("region", name="Quick Actions Menu")
        region.wait_for(state="visible", timeout=10000)

        # Get the FAB (it's the last button in the region)
        fab = region.locator("button").last

        # Take initial screenshot (closed state)
        print("Taking initial screenshot...")
        page.screenshot(path="verification/quick_actions_closed.png")

        # Click to open
        print("Clicking FAB...")
        try:
            fab.click(timeout=2000)
        except:
            print("Regular click failed, trying force click...")
            fab.click(force=True)

        # Verify it opened (aria-label changes to "Close Quick Actions")
        expect(fab).to_have_attribute("aria-label", "Close Quick Actions")
        expect(fab).to_have_attribute("aria-expanded", "true")

        # Verify menu items are visible
        print("Verifying menu items...")
        page.wait_for_timeout(500)

        # Find Practice button WITHIN the region
        practice_btn = region.get_by_label("Practice")
        expect(practice_btn).to_be_visible()

        # Take screenshot (open state)
        print("Taking open screenshot...")
        page.screenshot(path="verification/quick_actions_open.png")

        # Test Escape key
        print("Testing Escape key...")
        page.keyboard.press("Escape")

        # Verify it closed
        expect(fab).to_have_attribute("aria-label", "Open Quick Actions")
        expect(fab).to_have_attribute("aria-expanded", "false")

        # Take screenshot (closed again)
        print("Taking final screenshot...")
        page.screenshot(path="verification/quick_actions_closed_after_escape.png")

        browser.close()
        print("Verification complete!")

if __name__ == "__main__":
    run()
