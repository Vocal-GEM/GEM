from playwright.sync_api import sync_playwright
import time
import json

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 720})
        page = context.new_page()

        print("Navigating to http://localhost:3000/ ...")
        page.goto('http://localhost:3000/')

        # Set all localStorage keys to bypass onboarding
        page.evaluate("""() => {
            localStorage.setItem('gem_voice_profile_onboarding_done', 'true');
            localStorage.setItem('gem_tutorial_seen', 'true');
            localStorage.setItem('gem_compass_seen', 'true');
            localStorage.setItem('gem_calibration_done', 'true');
            localStorage.setItem('gem_onboarding_complete', 'true');
            localStorage.setItem('gem_onboarding_seen', 'true');
            localStorage.setItem('gem_welcome_dismissed', 'true');
            localStorage.setItem('gem_completed_tours', JSON.stringify(['practice_mode', 'history_view', 'spectrogram']));
        }""")

        print("Reloading page...")
        page.reload()
        page.wait_for_load_state("networkidle")

        # Try to find the FAB
        try:
            # Force remove overlays
            print("Removing blocking overlays...")
            page.evaluate("""() => {
                const overlays = document.querySelectorAll('div[class*="z-[9999]"], div[class*="z-[10000]"]');
                overlays.forEach(el => el.remove());
            }""")

            fab = page.get_by_label("Open Quick Actions")
            fab.wait_for(state="visible", timeout=10000)
            print("Found FAB!")

            # Click it
            fab.click()
            print("Clicked FAB")

            time.sleep(1)

            # Verify menu items
            if page.get_by_text("Practice").is_visible():
                print("Menu opened, Practice button visible")
            else:
                print("Menu opened but Practice button not visible?")

            page.screenshot(path="verification/quick_actions_success.png")
            print("Success screenshot saved: verification/quick_actions_success.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")

        browser.close()

if __name__ == "__main__":
    run()
