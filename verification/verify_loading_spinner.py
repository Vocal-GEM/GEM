from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app
        # Since I replaced App.jsx, the root URL should show the verification page
        page.goto("http://localhost:3000")

        # Wait for the title to appear
        page.get_by_text("Palette 🎨 UX Verification").wait_for()

        # Verify specific elements exist
        # Check for LoadingSpinner Size labels
        page.get_by_text("XS").wait_for()
        page.get_by_text("XL").wait_for()

        # Check for Button Integration section
        page.get_by_text("Button Integration").wait_for()

        # Take a screenshot
        screenshot_path = "/home/jules/verification/loading_spinner_verification.png"
        page.screenshot(path=screenshot_path, full_page=True)

        print(f"Screenshot saved to {screenshot_path}")
        browser.close()

if __name__ == "__main__":
    run()
