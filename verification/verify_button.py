
import os
import sys
from playwright.sync_api import sync_playwright

def verify_button(page):
    print("Navigating to app...")
    # The app should be running on port 3000
    try:
        page.goto("http://localhost:3000")
    except Exception as e:
        print(f"Error navigating to localhost:3000: {e}")
        return

    # We need to find a place where buttons are used.
    # Since I don't know the exact route to a "component showcase", I'll try to find a button on the home page or login.
    # Alternatively, I can inject a button into the DOM for verification purposes since I'm verifying the component logic,
    # but that might not reflect the React component usage.

    # Better approach: Navigate to a page that likely has buttons, like Login or Dashboard.
    # Let's try to find a button and take a screenshot of it.

    print("Waiting for any button...")
    try:
        # Wait for any button to appear
        page.wait_for_selector("button", timeout=5000)

        # Take a screenshot of the whole page first
        page.screenshot(path="verification/page_overview.png")
        print("Page overview screenshot taken.")

        # Now let's try to manually inject our modified Button component? No, we can't easily inject React components into a running build from outside.
        # We have to rely on existing usage.

        # Let's look for a button and hover over it.
        buttons = page.get_by_role("button").all()
        if buttons:
            print(f"Found {len(buttons)} buttons.")
            btn = buttons[0]
            btn.hover()
            page.screenshot(path="verification/button_hover.png")
            print("Button hover screenshot taken.")

    except Exception as e:
        print(f"Error finding buttons: {e}")
        page.screenshot(path="verification/error_state.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_button(page)
        finally:
            browser.close()
