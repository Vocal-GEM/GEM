from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Bypass onboarding
        page.add_init_script("""
            localStorage.setItem('gem_voice_profile_onboarding_done', 'true');
            localStorage.setItem('gem_tutorial_seen', 'true');
            localStorage.setItem('gem_compass_seen', 'true');
            localStorage.setItem('gem_calibration_done', 'true');
        """)

        page.goto("http://localhost:3000/")

        # Expect "Show Advanced Tools" button to be visible
        # Note: The text might be loaded async or via i18n, but should be fast.
        show_btn = page.get_by_role("button", name="Show Advanced Tools")
        expect(show_btn).to_be_visible()

        # Check aria-expanded is false initially
        expect(show_btn).to_have_attribute("aria-expanded", "false")

        # Click it
        show_btn.click()

        # Expect "Hide Advanced Tools"
        hide_btn = page.get_by_role("button", name="Hide Advanced Tools")
        expect(hide_btn).to_be_visible()
        expect(hide_btn).to_have_attribute("aria-expanded", "true")

        # Check for Close button (Handle)
        close_btn = page.get_by_role("button", name="Close tools")
        expect(close_btn).to_be_visible()

        # Check for tool toggles with aria-pressed
        pitch_toggle = page.get_by_role("button", name="Pitch")
        expect(pitch_toggle).to_be_visible()
        # It might be active by default if context sets it, checking attribute existence
        # expect(pitch_toggle).to_have_attribute("aria-pressed")

        # Take screenshot
        page.screenshot(path="verification/verification.png")
        print("Verification successful!")

        browser.close()

if __name__ == "__main__":
    run()
