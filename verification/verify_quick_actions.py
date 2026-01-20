from playwright.sync_api import Page, expect, sync_playwright
import json
import time

def verify_quick_actions(page: Page):
    # Set localStorage to bypass tours
    page.goto("http://localhost:3000")

    page.evaluate("""() => {
        localStorage.setItem('gem_voice_profile_onboarding_done', 'true');
        localStorage.setItem('gem_tutorial_seen', 'true');
        localStorage.setItem('gem_compass_seen', 'true');
        localStorage.setItem('gem_calibration_done', 'true');
        localStorage.setItem('gem_completed_tours', JSON.stringify(["dashboard", "practice_mode"]));
    }""")

    page.reload()

    # Dismiss any "Audio Context" banner if present (memory says anticipate it)
    # The banner usually has a "Dismiss" or "Start" button.
    # We can try to click anywhere to start audio context if needed, but usually we just want to ignore it for UI tests unless it blocks.

    # Wait for FAB
    # Note: If page load is slow, we might need to wait.
    fab = page.get_by_role("button", name="Open Quick Actions")
    expect(fab).to_be_visible(timeout=10000)

    # Check initial state
    expect(fab).to_have_attribute("aria-expanded", "false")

    # Click FAB
    fab.click()

    # Check expanded state
    expect(fab).to_have_attribute("aria-expanded", "true")
    expect(fab).to_have_attribute("aria-label", "Close Quick Actions")

    # Check menu items
    # The button has aria-label="Practice".
    practice_btn = page.get_by_role("button", name="Practice")
    expect(practice_btn).to_be_visible()
    expect(practice_btn).to_have_attribute("tabIndex", "0")

    # Wait for animation
    time.sleep(0.5)

    # Screenshot
    page.screenshot(path="verification/quick_actions.png")
    print("Screenshot saved to verification/quick_actions.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_quick_actions(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
