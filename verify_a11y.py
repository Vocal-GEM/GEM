from playwright.sync_api import sync_playwright

def run_cuj(page):
    # Use desktop viewport
    page.set_viewport_size({"width": 1280, "height": 800})
    page.goto("http://localhost:3000")
    page.wait_for_timeout(2000)

    # Click the "x" on the Start Practicing popup or any other overlay
    try:
        page.locator("button:has(svg.lucide-x)").first.click(timeout=1000)
        page.wait_for_timeout(1000)
    except:
        pass

    try:
        page.locator("button:has(svg.lucide-x)").last.click(timeout=1000)
        page.wait_for_timeout(1000)
    except:
        pass

    # The sidebar is just divs and buttons, no <a> tags.
    try:
        page.locator("button:has-text('Dashboard')").first.click(timeout=3000, force=True)
        page.wait_for_timeout(1000)
    except Exception as e:
        print(f"Could not click Dashboard: {e}")

    page.screenshot(path="/home/jules/verification/screenshots/verification2.png")

    # Scroll down to ensure it's visible
    page.mouse.wheel(0, 500)
    page.wait_for_timeout(1000)

    # Now let's find the slider. Use locator by class or input type if role fails due to shadow dom or something else
    fatigue_slider = page.locator("input[type='range']").first
    # We want to wait for the specific text "Vocal Fatigue" to make sure the panel loaded
    page.get_by_text("Vocal Fatigue").wait_for(state="visible", timeout=3000)

    # Interact with it
    fatigue_slider.focus()
    page.keyboard.press("ArrowRight")
    page.wait_for_timeout(500)

    page.screenshot(path="/home/jules/verification/screenshots/verification.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
