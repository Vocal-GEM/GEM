from playwright.sync_api import sync_playwright
import os

def verify_feedback_modal():
    os.makedirs("verification", exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to app...")
        try:
            page.goto("http://localhost:3000", timeout=60000)
        except Exception as e:
            print(f"Navigation failed: {e}")
            return

        print("Waiting for modal...")
        try:
            # Wait for the modal to appear
            # The modal has role="dialog" and aria-labelledby="feedback-modal-title"
            page.wait_for_selector('[role="dialog"]', timeout=10000)

            # Verify accessibility attributes
            modal = page.locator('[role="dialog"]')
            print(f"Modal detected: {modal.is_visible()}")

            title_id = modal.get_attribute("aria-labelledby")
            print(f"aria-labelledby: {title_id}")

            title = page.locator(f"#{title_id}")
            print(f"Title text: {title.text_content()}")

            # Verify inputs have labels
            textarea = page.locator("#feedback-message")
            label_for_textarea = page.locator('label[for="feedback-message"]')
            print(f"Textarea label: {label_for_textarea.text_content()}")

            # Take screenshot
            page.screenshot(path="verification/feedback_modal_accessibility.png")
            print("Screenshot saved to verification/feedback_modal_accessibility.png")

        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/error_screenshot.png")

        browser.close()

if __name__ == "__main__":
    verify_feedback_modal()
