from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            permissions=['microphone']
        )

        # Inject local storage to skip onboarding
        context.add_init_script("""
            localStorage.setItem('gem_tutorial_seen', 'true');
            localStorage.setItem('gem_compass_seen', 'true');
            localStorage.setItem('gem_calibration_done', 'true');
            localStorage.setItem('gem_voice_profile_onboarding_done', 'true');

            // Mock getUserMedia
            if (navigator.mediaDevices) {
                navigator.mediaDevices.getUserMedia = async (constraints) => {
                    console.log("Mocking getUserMedia");
                    const ctx = new (window.AudioContext || window.webkitAudioContext)();
                    const osc = ctx.createOscillator();
                    const dst = ctx.createMediaStreamDestination();
                    osc.connect(dst);
                    osc.start();
                    return dst.stream;
                };
            }
        """)

        page = context.new_page()

        try:
            print("Navigating to http://localhost:3000")
            page.goto("http://localhost:3000")
            page.wait_for_timeout(5000)

            print("Hiding overlays")
            page.evaluate("""
                const overlays = document.querySelectorAll('[class*="z-[9999]"]');
                overlays.forEach(el => el.style.display = 'none');
            """)

            print("Clicking Practice link (forcing)")
            try:
                practice_link = page.get_by_text("Practice").first
                practice_link.click(force=True)
            except Exception as e:
                print(f"Could not click Practice link: {e}")
                page.screenshot(path="verification/click_failure.png")

            page.wait_for_timeout(5000)

            print("Looking for mic-button")
            try:
                # mic-button usually has text "Start Session" (from screenshot)
                # In the code it was {isAudioActive ? "Stop" : "Enable"}
                # But screenshot shows "START SESSION".
                # Ah, screenshot shows "Start Session". The code I saw might be different or I misread.
                # Screenshot shows a big button: "START SESSION"

                # Let's try to click "START SESSION"
                start_btn = page.get_by_text("START SESSION", exact=False).first
                if start_btn.count() > 0:
                    start_btn.click(force=True)
                    print("Clicked START SESSION")
                else:
                    # Fallback to previous attempts
                    print("START SESSION not found, trying generic button")
                    mic_btn = page.locator("button:has-text('Start')").first
                    mic_btn.click(force=True)
            except Exception as e:
                print(f"Error clicking mic button: {e}")
                page.screenshot(path="verification/mic_failure.png")

            page.wait_for_timeout(3000)

            print("Checking for role='timer'")
            timer_locator = page.locator('[role="timer"]')

            if timer_locator.count() > 0:
                print("SUCCESS: Timer found with role='timer'")
                aria_label = timer_locator.first.get_attribute("aria-label")
                print(f"Timer aria-label: {aria_label}")
                timer_locator.first.screenshot(path="verification/timer_element.png")
            else:
                print("FAILURE: Timer element with role='timer' NOT found")

            page.screenshot(path="verification/full_page.png")

        except Exception as e:
            print(f"Script failed with error: {e}")
            page.screenshot(path="verification/error.png")

        finally:
            browser.close()

if __name__ == "__main__":
    run()
