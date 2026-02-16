from playwright.sync_api import sync_playwright
import time

def verify_voice_quality_meter():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a consistent context to store localStorage
        context = browser.new_context()
        page = context.new_page()

        # Set localStorage before navigation to bypass onboarding
        # We need to navigate to the origin first to set localStorage
        try:
            # Try port 3000, as shown in dev logs
            page.goto("http://localhost:3000")
        except:
            print("Failed to load page on port 3000. Is the dev server running?")
            return

        # Inject localStorage items
        page.evaluate("""() => {
            localStorage.setItem('gem_voice_profile_onboarding_done', 'true');
            localStorage.setItem('gem_tutorial_seen', 'true');
            localStorage.setItem('gem_compass_seen', 'true');
            localStorage.setItem('gem_calibration_done', 'true');
            localStorage.setItem('gem_tour_completed', 'true');
            localStorage.setItem('gem_completed_tours', '["history_view", "dashboard"]');
        }""")

        # Reload to apply localStorage settings
        page.reload()

        # Wait for page load
        page.wait_for_load_state("networkidle")

        # Handle Migration Modal if present
        try:
            # Wait for any modal to appear
            time.sleep(2)

            # Look for buttons
            buttons = page.get_by_role("button").all()
            for btn in buttons:
                txt = btn.text_content()
                if txt and ("Close" in txt or "Skip" in txt or "Continue" in txt or "Start" in txt):
                    if btn.is_visible():
                        print(f"Clicking button: {txt}")
                        btn.click()
                        time.sleep(1)
        except Exception as e:
            print(f"Modal handling error: {e}")

        # Wait for Practice view to stabilize
        time.sleep(2)

        # Look for "Weight" tool or VoiceQualityMeter
        # The app might default to "Practice" tab, but maybe "Overview" sub-tab?
        # PracticeView renders ResizableToolGrid.

        # Check if "Vocal Weight" is visible
        if page.get_by_text("Vocal Weight").is_visible():
            print("VoiceQualityMeter is visible!")
        else:
            print("VoiceQualityMeter not found. Looking for 'Tools'...")
            # Try to click "Tools" button to show the drawer.
            try:
                # Find button containing "Tools" text
                tools_btn = page.get_by_role("button", name="Tools")
                if tools_btn.is_visible():
                    tools_btn.click()
                    time.sleep(1)
                    print("Opened Tools drawer.")
                else:
                    # Maybe it's hidden or named differently
                    # Try finding by text only
                    page.get_by_text("Tools").click()
                    time.sleep(1)
                    print("Opened Tools drawer via text.")
            except Exception as e:
                print(f"Could not open Tools drawer: {e}")

        # Try clicking "Weight" tool specifically if the drawer is open
        try:
            weight_btn = page.get_by_text("Weight")
            if weight_btn.is_visible():
                weight_btn.click()
                time.sleep(1)
                print("Activated Weight tool.")
        except:
            pass

        # Take screenshot
        output_path = "verification/verification.png"
        page.screenshot(path=output_path)
        print(f"Screenshot saved to {output_path}")

        browser.close()

if __name__ == "__main__":
    verify_voice_quality_meter()
