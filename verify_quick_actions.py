import os
import json
from playwright.sync_api import sync_playwright, expect

def verify_quick_actions():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:3000/")

        print("Setting up localStorage...")
        page.evaluate("""() => {
            localStorage.setItem('gem_voice_profile_onboarding_done', 'true');
            localStorage.setItem('gem_tutorial_seen', 'true');
            localStorage.setItem('gem_compass_seen', 'true');
            localStorage.setItem('gem_calibration_done', 'true');
            localStorage.setItem('gem_onboarding_complete', 'true');
            localStorage.setItem('gem_welcome_dismissed', 'true');
            const tours = ['practice_mode', 'history_view', 'spectrogram', 'daf_mode', 'recordings_view'];
            localStorage.setItem('gem_completed_tours', JSON.stringify(tours));
        }""")
        page.reload()

        print("Waiting for FAB...")
        # Use aria-controls which is stable
        fab = page.locator("button[aria-controls='quick-actions-menu']")
        try:
            fab.wait_for(state="visible", timeout=5000)
            print("FAB found.")
        except:
            print("FAB not found. Dumping content...")
            # print(page.content())
            browser.close()
            return

        if not os.path.exists("verification"):
            os.makedirs("verification")

        page.screenshot(path="verification/quick_actions_closed.png")
        print("Captured closed state.")

        # Click to open
        print("Clicking FAB...")
        fab.click()

        # Wait for menu to open
        page.wait_for_timeout(1000) # Wait for animation

        # Verify expanded state
        expect(fab).to_have_attribute("aria-expanded", "true")
        print("aria-expanded is true.")

        # Verify menu visibility
        menu = page.locator("#quick-actions-menu")
        expect(menu).to_be_visible()
        expect(menu).to_have_attribute("aria-hidden", "false")
        print("Menu is visible and aria-hidden is false.")

        page.screenshot(path="verification/quick_actions_open.png")
        print("Captured open state.")

        # Press Escape
        print("Pressing Escape...")
        page.keyboard.press("Escape")
        page.wait_for_timeout(1000) # Wait for animation

        # Verify closed state
        expect(fab).to_have_attribute("aria-expanded", "false")
        expect(menu).to_have_attribute("aria-hidden", "true")
        print("Menu closed successfully via Escape.")

        browser.close()

if __name__ == "__main__":
    verify_quick_actions()
