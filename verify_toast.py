from playwright.sync_api import sync_playwright, expect

def verify_toast():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to app...")
            page.goto("http://localhost:3000")

            # Wait for title to confirm load
            expect(page.get_by_role("heading", name="Toast Verification")).to_be_visible(timeout=10000)
            print("Page loaded.")

            # Click all buttons
            page.get_by_role("button", name="Success").click()
            page.get_by_role("button", name="Error").click()
            page.get_by_role("button", name="Warning").click()
            page.get_by_role("button", name="Info").click()

            # Verify toasts appear
            expect(page.get_by_text("This is a success toast")).to_be_visible()
            expect(page.get_by_text("This is a error toast")).to_be_visible()
            expect(page.get_by_text("This is a warning toast")).to_be_visible()
            expect(page.get_by_text("This is a info toast")).to_be_visible()

            # Verify accessibility roles
            # Success/Info should be status
            expect(page.locator("div[role='status']")).to_have_count(2)
            # Error/Warning should be alert
            expect(page.locator("div[role='alert']")).to_have_count(2)

            print("Taking screenshot...")
            page.screenshot(path="toast_verification.png")
            print("Screenshot saved to toast_verification.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_toast()
