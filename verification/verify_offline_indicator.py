import os
from playwright.sync_api import sync_playwright, expect

def test_offline_indicator(page):
    # Navigate to the app
    page.goto("http://localhost:3000")

    # Wait for app to load
    page.wait_for_timeout(2000)

    # Simulate offline mode
    print("Simulating offline mode...")
    page.context.set_offline(True)

    # Wait for the indicator to appear
    # The indicator has role="status" and text "Offline Mode"
    indicator = page.get_by_role("status").filter(has_text="Offline Mode")

    expect(indicator).to_be_visible(timeout=5000)

    # Take screenshot
    if not os.path.exists("verification"):
        os.makedirs("verification")

    page.screenshot(path="verification/offline_indicator.png")
    print("Screenshot saved to verification/offline_indicator.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        try:
            test_offline_indicator(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
