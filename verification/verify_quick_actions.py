from playwright.sync_api import sync_playwright
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(
        viewport={'width': 1280, 'height': 720}
    )

    # Set up localStorage to bypass onboarding and tours
    page = context.new_page()
    page.add_init_script("""
        localStorage.setItem('gem_voice_profile_onboarding_done', 'true');
        localStorage.setItem('gem_tutorial_seen', 'true');
        localStorage.setItem('gem_compass_seen', 'true');
        localStorage.setItem('gem_calibration_done', 'true');
        localStorage.setItem('gem_user_profile', '{"name":"Test User"}');
        localStorage.setItem('gem_welcome_dismissed', 'true');
        localStorage.setItem('gem_completed_tours', '["practice_mode", "history_view", "spectrogram", "daf_mode", "recordings_view"]');
    """)

    page.goto("http://localhost:3000/")

    # Wait for the FAB to appear
    fab = page.get_by_label("Open Quick Actions")
    fab.wait_for()

    # Wait for any potential overlay to disappear (or handle it)
    time.sleep(2)

    # Check if there is a tour overlay and skip it
    skip_btn = page.get_by_text("Skip Tour")
    if skip_btn.is_visible():
        skip_btn.click()
        time.sleep(1)

    # Take a screenshot before clicking (closed state)
    page.screenshot(path="verification/quick_actions_closed.png")

    # Click the FAB
    # Force click if necessary, but better to ensure overlay is gone
    fab.click()

    # Wait for the menu to expand. The FAB label changes to "Close Quick Actions"
    page.get_by_label("Close Quick Actions").wait_for()

    # Wait a bit for animation
    page.wait_for_timeout(1000)

    # Take a screenshot after clicking (open state)
    page.screenshot(path="verification/quick_actions_open.png")

    browser.close()

if __name__ == "__main__":
    with sync_playwright() as playwright:
        run(playwright)
