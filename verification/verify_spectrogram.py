from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Set localStorage before loading
        page.add_init_script("""
            localStorage.setItem('gem_voice_profile_onboarding_done', 'true');
            localStorage.setItem('gem_tutorial_seen', 'true');
            localStorage.setItem('gem_compass_seen', 'true');
            localStorage.setItem('gem_calibration_done', 'true');
            localStorage.setItem('gem_onboarding_complete', 'true');
            localStorage.setItem('gem_welcome_dismissed', 'true');
            localStorage.setItem('gem_completed_tours', '["practice_mode", "spectrogram", "dashboard", "main-tour"]');
        """)

        print("Navigating to http://localhost:3000/")
        page.goto("http://localhost:3000/")
        page.wait_for_timeout(5000) # Wait for initial load/hydration

        # Click Practice in sidebar
        print("Looking for Practice button...")
        try:
            practice_btn = page.get_by_role("button", name="Practice")
            if practice_btn.count() > 0:
                practice_btn.first.click()
                print("Clicked Practice button (role)")
            else:
                 print("Practice button (role) not found, trying text")
                 page.get_by_text("Practice").first.click()
                 print("Clicked Practice text")
        except Exception as e:
            print(f"Error clicking Practice: {e}")

        page.wait_for_timeout(3000)

        # Click Spectrogram tab
        print("Looking for Spectrogram tab...")
        try:
            spectrogram_tab = page.get_by_role("button", name="Spectrogram")
            if spectrogram_tab.count() > 0:
                spectrogram_tab.first.click()
                print("Clicked Spectrogram tab (role)")
            else:
                print("Spectrogram tab (role) not found, trying text")
                page.get_by_text("Spectrogram").first.click()
                print("Clicked Spectrogram text")
        except Exception as e:
            print(f"Error clicking Spectrogram tab: {e}")

        page.wait_for_timeout(2000)

        page.screenshot(path="verification_spectrogram.png")
        print("Screenshot saved to verification_spectrogram.png")

        browser.close()

if __name__ == "__main__":
    run()
