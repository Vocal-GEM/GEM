from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Create context with storage state to bypass onboarding if possible?
        # Or just dismiss it.
        context = browser.new_context()
        page = context.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:3000")

        # Check for Skip Setup button
        skip_btn = page.get_by_role("button", name="Skip Setup")
        if skip_btn.is_visible(timeout=5000):
            print("Found Skip Setup button. Clicking...")
            skip_btn.click()

        # Check for Intake Questionnaire close button or skip
        # It has onClose={() => setShowIntake(false)}
        # It's an overlay. Maybe click outside or find a close button?
        # IntakeQuestionnaire usually has a close button.

        # Let's wait a bit for animations
        page.wait_for_timeout(2000)

        # Try to find Practice button again.
        print("Waiting for Practice link...")
        practice_btn = page.get_by_role("button", name="Practice", exact=True)

        # Check if overlay is still there
        # Maybe use force=True to click through? Not recommended but might work for verification.
        # Better: find what's blocking.

        if practice_btn.is_visible():
            print("Clicking Practice button...")
            try:
                practice_btn.click(timeout=5000)
            except Exception as e:
                print(f"Click failed: {e}")
                print("Attempting to dismiss overlays...")
                # Try clicking top right corner or ESC
                page.keyboard.press("Escape")
                page.wait_for_timeout(500)
                practice_btn.click(force=True)

        print("Clicked Practice.")

        # Wait for PitchOrb content
        # PitchOrb has text "Pitch"
        print("Waiting for PitchOrb content...")

        # We need to verify PitchOrb is rendered.
        # Look for "Show Notes" button which is unique to PitchOrb
        show_notes_btn = page.get_by_role("button", name="Show Notes")
        expect(show_notes_btn).to_be_visible(timeout=10000)

        print("PitchOrb detected!")

        page.screenshot(path="verification_pitch_orb.png")
        print("Screenshot saved to verification_pitch_orb.png")

        browser.close()

if __name__ == "__main__":
    run()
