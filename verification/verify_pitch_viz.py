from playwright.sync_api import sync_playwright
import time
import json
import os

def verify_pitch_viz():
    # Ensure directory exists
    os.makedirs("verification", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Set localStorage to skip onboarding
        page.goto("http://localhost:3000")
        page.evaluate("""() => {
            localStorage.setItem('gem_voice_profile_onboarding_done', 'true');
            localStorage.setItem('gem_tutorial_seen', 'true');
            localStorage.setItem('gem_compass_seen', 'true');
            localStorage.setItem('gem_calibration_done', 'true');
            localStorage.setItem('gem_completed_tours', JSON.stringify(["practice_mode", "dashboard", "library", "spectrogram"]));
        }""")
        page.reload()

        # Debug: take screenshot of initial load
        time.sleep(3)
        page.screenshot(path="verification/debug_load.png")
        print("Initial load screenshot saved.")

        # Check if we are stuck on something
        if page.get_by_text("Loading").count() > 0:
            print("Still loading...")

        # Try to find practice button
        try:
            # Use exact match for Practice button
            practice_btn = page.get_by_role("button", name="Practice", exact=True)
            if practice_btn.count() > 0:
                practice_btn.click()
                print("Clicked Practice button")
            else:
                # Fallback to sidebar specific logic if needed, but exact=True should work if the button text is exactly "Practice"
                # Looking at debug output: 'Practice' is in the list.
                print("Practice button not found by role (exact), trying relaxed")
                page.get_by_role("button", name="Practice").first.click()
                print("Clicked first Practice button")
        except Exception as e:
            print(f"Error clicking practice: {e}")
            return

        # Wait for Practice Mode to load
        try:
            # The text might be "Enable Microphone" or "Start Session"
            # Debug output showed 'START SESSION' button.
            # But line 273 in PracticeMode.jsx says {t('practiceMode.session.start', 'Enable Microphone')}
            # Maybe translation is missing and it falls back to key? Or uses English 'Enable Microphone'?
            # But debug output showed 'START SESSION' in the list!
            # Wait, line 273: {isAudioActive ? ... : ... 'Enable Microphone'}
            # Maybe "START SESSION" comes from somewhere else?
            # Ah, maybe I was looking at 'Overview' tab initially?
            # 'Overview' tab has 'START SESSION'?
            # Let's check PracticeMode.jsx line 355:
            # <div className="flex justify-center -mt-2"> <button ...> {isAudioActive ? 'Stop Microphone' : 'Enable Microphone'} </button>

            # If I see 'START SESSION' in buttons list, where is it from?
            # Maybe the screenshot can tell.
            pass
        except:
            pass

        time.sleep(2)

        # Click "Pitch" tab
        try:
            # There might be multiple "Pitch" texts (e.g. in charts).
            # The tab is a button.
            page.get_by_role("button", name="Pitch", exact=True).click()
            print("Clicked Pitch tab")
        except:
             print("Pitch tab not found, trying first")
             page.get_by_role("button", name="Pitch").first.click()

        # Wait a bit for lazy load
        time.sleep(2)

        # Verify canvas exists
        canvas = page.locator("canvas")
        if canvas.count() > 0 and canvas.first.is_visible():
            print("Canvas is visible")
        else:
            print("Canvas NOT visible")

        # Take screenshot
        page.screenshot(path="verification/pitch_viz.png")
        print("Screenshot saved to verification/pitch_viz.png")

        browser.close()

if __name__ == "__main__":
    verify_pitch_viz()
