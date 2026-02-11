from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        # 1. Set localStorage to bypass onboarding
        page.goto("http://localhost:5173")
        page.evaluate("""
            localStorage.setItem('gem_tutorial_seen', 'true');
            localStorage.setItem('gem_compass_seen', 'true');
            localStorage.setItem('gem_calibration_done', 'true');
            localStorage.setItem('gem_voice_profile_onboarding_done', 'true');
        """)
        page.reload()

        # 2. Kill overlays
        time.sleep(2) # wait for overlays to appear
        print("Removing overlays...")
        page.evaluate("""
            const overlays = document.querySelectorAll('div');
            overlays.forEach(div => {
                if (div.innerText.includes('Start Practicing') || div.innerText.includes('Skip Tour')) {
                     // Check if it's the overlay container (usually has z-index)
                     const style = window.getComputedStyle(div);
                     if (style.position === 'fixed' || style.position === 'absolute') {
                         div.style.display = 'none';
                     }
                }
            });
            // Also try to find the backdrop
            const backdrops = document.querySelectorAll('.bg-black\\\\/50');
            backdrops.forEach(b => b.style.display = 'none');
        """)

        # 3. Click "Open Form" button
        print("Waiting for Open Form button...")
        try:
            page.wait_for_selector("#open-journal-form-btn", state="visible", timeout=5000)
            page.click("#open-journal-form-btn")
            print("Clicked Open Form button")
        except Exception as e:
            print(f"Failed to click Open Form button: {e}")
            page.screenshot(path="verification_failed_button.png")
            return

        # 4. Wait for the form to appear
        print("Waiting for form...")
        try:
            page.wait_for_selector("text=Log Practice Session", timeout=10000)
            # Wait a bit for animations
            time.sleep(1)

            # Take screenshot
            page.screenshot(path="verification_journal_form_clean.png")
            print("Screenshot saved to verification_journal_form_clean.png")
        except Exception as e:
            print(f"Failed to find form: {e}")
            page.screenshot(path="verification_failed_form.png")

        browser.close()

if __name__ == "__main__":
    run()
