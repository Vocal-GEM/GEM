from playwright.sync_api import sync_playwright, expect

def verify_quick_settings(page):
    page.goto("http://localhost:3000/")

    # Wait for the QuickSettings to appear
    # We added role="dialog" and aria-labelledby="quick-settings-title"
    settings_dialog = page.get_by_role("dialog", name="Quick Settings")
    expect(settings_dialog).to_be_visible()

    # Check for the Close button
    close_button = page.get_by_role("button", name="Close settings")
    expect(close_button).to_be_visible()

    # Check for Listen Mode switch
    listen_switch = page.get_by_role("switch", name="Listen Mode")
    expect(listen_switch).to_be_visible()

    # Check for Privacy switch
    privacy_switch = page.get_by_role("switch", name="Share Usage Data")
    expect(privacy_switch).to_be_visible()

    # Check for Theme buttons (radio-like behavior via aria-pressed)
    dark_theme = page.get_by_role("button", name="Dark")
    expect(dark_theme).to_be_visible()
    # If it's pressed (dark theme is default), it should have aria-pressed="true"
    # But checking attribute is tricky with locators, we can check via JS evaluation if needed
    # Or just visually confirm via screenshot.

    # Take screenshot
    page.screenshot(path="/home/jules/verification/quick_settings.png")
    print("Verification complete! Screenshot saved to /home/jules/verification/quick_settings.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_quick_settings(page)
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="/home/jules/verification/error_screenshot.png")
            raise e
        finally:
            browser.close()
