from playwright.sync_api import sync_playwright, expect
import time

def verify_quick_actions():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1280, 'height': 720}
        )

        # Set localStorage to bypass onboarding/tours
        context.add_init_script("""
            localStorage.setItem('gem_voice_profile_onboarding_done', 'true');
            localStorage.setItem('gem_tutorial_seen', 'true');
            localStorage.setItem('gem_compass_seen', 'true');
            localStorage.setItem('gem_calibration_done', 'true');
            localStorage.setItem('gem_onboarding_complete', 'true');
            localStorage.setItem('gem_welcome_dismissed', 'true');
            localStorage.setItem('gem_completed_tours', JSON.stringify(['practice_mode', 'spectrogram', 'dashboard', 'main-tour']));
        """)

        page = context.new_page()

        print("Navigating to home page...")
        try:
            page.goto("http://localhost:3000")
        except Exception as e:
            print(f"Failed to navigate: {e}")
            return

        # Check for Tour Overlay and skip if present
        try:
            skip_button = page.get_by_role("button", name="Skip Tour")
            if skip_button.is_visible(timeout=2000):
                print("Tour overlay detected. Clicking Skip...")
                skip_button.click()
                time.sleep(1)
        except Exception:
            pass # No tour active

        print("Waiting for Quick Actions FAB...")
        # Wait for the FAB to be visible
        try:
            fab = page.get_by_label("Open Quick Actions")
            expect(fab).to_be_visible(timeout=10000)
            print("FAB found.")
        except Exception as e:
            print(f"FAB not found: {e}")
            page.screenshot(path="verification/error_fab_not_found.png")
            browser.close()
            return

        # Take a screenshot before clicking
        page.screenshot(path="verification/quick_actions_closed.png")

        print("Clicking FAB...")
        fab.click()

        # Wait for menu to open (animations)
        time.sleep(1)

        # Check that the FAB label changed to "Close Quick Actions"
        try:
            close_fab = page.get_by_label("Close Quick Actions")
            expect(close_fab).to_be_visible()
            expect(close_fab).to_have_attribute("aria-expanded", "true")
            print("Menu expanded and label updated correctly.")
        except Exception as e:
            print(f"Verification failed: {e}")

        # Take a screenshot of open menu
        page.screenshot(path="verification/quick_actions_open.png")
        print("Screenshot saved to verification/quick_actions_open.png")

        browser.close()

if __name__ == "__main__":
    verify_quick_actions()
