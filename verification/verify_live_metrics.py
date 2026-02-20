
from playwright.sync_api import sync_playwright
import time
import os

def run():
    # Ensure verification directory exists
    os.makedirs('verification', exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Set localStorage to bypass onboarding
        page.goto("http://localhost:3000")
        page.evaluate("""
            localStorage.setItem('gem_voice_profile_onboarding_done', 'true');
            localStorage.setItem('gem_tutorial_seen', 'true');
            localStorage.setItem('gem_compass_seen', 'true');
            localStorage.setItem('gem_calibration_done', 'true');
            localStorage.setItem('hasVisited', 'true');
        """)

        page.reload()
        page.wait_for_timeout(3000)

        # Take screenshot of dashboard
        page.screenshot(path="verification/dashboard.png")

        # Try to click "Practice" button with FORCE
        practice_link = page.get_by_text("Practice")
        if practice_link.count() > 0:
            print("Found Practice link, attempting force click...")
            try:
                practice_link.first.click(force=True)
                page.wait_for_timeout(2000)
                page.screenshot(path="verification/practice_nav.png")

                # Check for LiveMetricsBar
                f0_loc = page.get_by_text("F0:")
                if f0_loc.count() > 0:
                     print("LiveMetricsBar found after navigation!")
                else:
                     print("Still no LiveMetricsBar.")
            except Exception as e:
                print(f"Force click failed: {e}")
        else:
             print("Could not find Practice link.")

        page.screenshot(path="verification/final.png")
        browser.close()

if __name__ == "__main__":
    run()
