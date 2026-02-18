import os
from playwright.sync_api import sync_playwright

def verify_quick_actions():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Navigate to the app
        page.goto("http://localhost:3000/")

        # Bypass onboarding
        page.evaluate("""() => {
            localStorage.setItem('gem_voice_profile_onboarding_done', 'true');
            localStorage.setItem('gem_tutorial_seen', 'true');
            // Try to set completed tours to something that might prevent tours
            // But if we don't know the IDs, we rely on the Skip button.
        }""")

        # Reload to apply localStorage changes
        page.reload()

        # Wait for potential tour overlay
        page.wait_for_timeout(2000)

        # Check for Skip Tour button
        skip_btn = page.get_by_role("button", name="Skip Tour")
        if skip_btn.is_visible():
            print("Found Skip Tour button, clicking...")
            skip_btn.click()
            page.wait_for_timeout(1000)

        # Also check for "Skip Setup" button from App.jsx
        skip_setup_btn = page.get_by_role("button", name="Skip Setup")
        if skip_setup_btn.is_visible():
             print("Found Skip Setup button, clicking...")
             skip_setup_btn.click()
             page.wait_for_timeout(1000)

        # Wait for the app to load (look for the Quick Actions button)
        # The button has aria-label="Open Quick Actions"
        quick_actions_btn = page.get_by_label("Open Quick Actions")
        quick_actions_btn.wait_for()

        # Take a screenshot before opening
        os.makedirs("verification", exist_ok=True)
        page.screenshot(path="verification/quick_actions_closed.png")
        print("Screenshot taken: verification/quick_actions_closed.png")

        # Click to open
        print("Attempting to click Quick Actions button...")
        quick_actions_btn.click()

        # Wait for the menu to appear (it has a transition, so give it a moment)
        page.wait_for_timeout(500)

        # Verify menu is open (button label changes to "Close Quick Actions")
        close_btn = page.get_by_label("Close Quick Actions")
        if close_btn.is_visible():
            print("Menu opened successfully")
        else:
            print("Menu failed to open")

        # Take a screenshot of the open menu
        page.screenshot(path="verification/quick_actions_open.png")
        print("Screenshot taken: verification/quick_actions_open.png")

        # Test Escape key
        page.keyboard.press("Escape")

        # Wait for transition
        page.wait_for_timeout(500)

        # Verify menu is closed
        if quick_actions_btn.is_visible():
             print("Menu closed successfully via Escape")
        else:
             print("Menu failed to close via Escape")

        page.screenshot(path="verification/quick_actions_closed_after_escape.png")
        print("Screenshot taken: verification/quick_actions_closed_after_escape.png")

        browser.close()

if __name__ == "__main__":
    verify_quick_actions()
