from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Grant camera permission just in case, though we mock it
        context = browser.new_context(permissions=['camera'])
        page = context.new_page()

        # Mock getUserMedia to return a fake stream so FloatingCamera renders without error
        page.add_init_script("""
            navigator.mediaDevices.getUserMedia = async (constraints) => {
                const canvas = document.createElement('canvas');
                canvas.width = 640;
                canvas.height = 480;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = 'green';
                ctx.fillRect(0, 0, 640, 480);
                // Need to keep the stream active
                setInterval(() => {
                    ctx.fillStyle = ctx.fillStyle === 'green' ? 'blue' : 'green';
                    ctx.fillRect(0, 0, 640, 480);
                }, 1000);
                const stream = canvas.captureStream(30);
                return stream;
            };
        """)

        # Navigate to the app (using port 3000 as seen in log)
        page.goto("http://localhost:3000")

        # Bypass onboarding
        page.evaluate("localStorage.setItem('gem_voice_profile_onboarding_done', 'true')")
        page.evaluate("localStorage.setItem('gem_tutorial_seen', 'true')")
        page.evaluate("localStorage.setItem('gem_compass_seen', 'true')")
        page.evaluate("localStorage.setItem('gem_calibration_done', 'true')")

        page.reload()

        # Wait for sidebar to load
        page.wait_for_selector("nav", timeout=10000)

        # Handle any modal that appears (e.g. "Skip Setup")
        try:
            skip_btn = page.get_by_text("Skip Setup")
            if skip_btn.is_visible(timeout=2000):
                skip_btn.click()
        except:
            pass

        # Click Mirror button
        try:
            mirror_btn = page.get_by_role("button", name="Mirror")
            # Force click if blocked
            mirror_btn.click(force=True)
        except Exception as e:
            print(f"Error clicking Mirror button: {e}")
            page.screenshot(path="verification/error_screenshot.png")
            browser.close()
            return

        # Wait for FloatingCamera video element
        try:
            page.wait_for_selector("video", timeout=10000)
        except Exception as e:
             print(f"Video not found: {e}")
             page.screenshot(path="verification/error_video_screenshot.png")
             browser.close()
             return

        # Find container
        floating_cam_container = page.locator("div.group").filter(has=page.locator("video")).first

        # Check buttons ARIA labels
        # Zoom out
        zoom_out = floating_cam_container.locator("button").nth(0) # First button in controls
        # Wait, order might differ. Let's use filter by icon if possible, or just index if we know structure.
        # But we added aria-label, so we can check by aria-label directly!

        zoom_out = floating_cam_container.get_by_label("Zoom out")
        expect(zoom_out).to_be_attached()

        zoom_in = floating_cam_container.get_by_label("Zoom in")
        expect(zoom_in).to_be_attached()

        toggle_size = floating_cam_container.get_by_label("Toggle camera size")
        expect(toggle_size).to_be_attached()

        close_cam = floating_cam_container.get_by_label("Close camera")
        expect(close_cam).to_be_attached()

        # Take screenshot
        page.screenshot(path="verification/floating_camera_verified.png")
        print("FloatingCamera verification successful!")

        browser.close()

if __name__ == "__main__":
    run()
