import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        page.goto("http://localhost:3000")

        # Set all possible flags to skip onboarding and tours
        page.evaluate("""() => {
            localStorage.setItem('gem_voice_profile_onboarding_done', 'true');
            localStorage.setItem('gem_tutorial_seen', 'true');
            localStorage.setItem('gem_compass_seen', 'true');
            localStorage.setItem('gem_calibration_done', 'true');
            localStorage.setItem('gem_completed_tours', JSON.stringify(['practice_mode', 'pitch', 'spectrogram', 'daf_mode']));
        }""")

        page.reload()

        try:
            # Wait for any overlay to disappear or click close button
            # Sometimes there is a 'Skip Tour' button
            if page.is_visible('button:has-text("Skip Tour")'):
                page.click('button:has-text("Skip Tour")')

            if page.is_visible('button:has-text("Skip Setup")'):
                page.click('button:has-text("Skip Setup")')

            # Force click practice if needed
            page.wait_for_selector('text=Practice', timeout=10000)

            # Click Pitch tab
            # Force click to bypass overlays if any
            page.click('button[aria-label="Switch to Pitch"]', force=True)

            # Wait for canvas
            page.wait_for_selector('canvas', timeout=10000)

            time.sleep(2)
            page.screenshot(path="verification/pitch_visualizer.png")
            print("Screenshot saved to verification/pitch_visualizer.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")

        browser.close()

if __name__ == "__main__":
    run()
