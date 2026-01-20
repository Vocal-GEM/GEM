from playwright.sync_api import sync_playwright, expect
import time
import os

def run():
    # Ensure directory exists
    os.makedirs("verification", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to app
        print("Navigating to http://localhost:3000")
        page.goto("http://localhost:3000")

        # Wait for the meter to appear
        print("Waiting for component...")
        # Use exact match or role to avoid ambiguity
        expect(page.get_by_role("heading", name="Brightness Meter", exact=True)).to_be_visible()

        # Wait a bit for animation to sweep
        print("Waiting for animation...")
        time.sleep(1)

        # Take screenshot
        print("Taking screenshot...")
        page.screenshot(path="verification/brightness_meter.png")

        browser.close()
        print("Done.")

if __name__ == "__main__":
    run()
