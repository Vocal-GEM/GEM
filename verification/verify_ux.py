
import os
import json
from playwright.sync_api import sync_playwright, expect

def verify_empty_state(page):
    # Set localStorage to bypass onboarding/tours
    page.goto("http://localhost:3000")
    page.evaluate('''() => {
        localStorage.setItem('gem_voice_profile_onboarding_done', 'true');
        localStorage.setItem('gem_tutorial_seen', 'true');
        localStorage.setItem('gem_compass_seen', 'true');
        localStorage.setItem('gem_calibration_done', 'true');
        localStorage.setItem('gem_completed_tours', JSON.stringify(["practice_mode", "dashboard", "library"]));
    }''')

    # Reload to apply storage changes
    page.reload()

    # Navigate to a page that likely uses EmptyState or force one
    # Since I don't know exactly which page uses EmptyState, I'll try to find one.
    # The file system shows 'AudioLibrary.jsx', maybe the library is empty?
    page.goto("http://localhost:3000/library")

    # Wait for content to load
    page.wait_for_timeout(2000)

    # Check if we can find the EmptyState component visuals
    # The EmptyState has a specific structure: div with role="region"

    # If library is not empty, we might not see it.
    # Alternatively, we can mount the component in a test environment, but here we need to see it in the app.
    # Let's try to find an EmptyState by role="region" and aria-label

    empty_states = page.get_by_role("region")
    count = empty_states.count()
    print(f"Found {count} empty states")

    if count > 0:
        empty_states.first.scroll_into_view_if_needed()
        page.screenshot(path="verification/empty_state.png")
    else:
        # If we can't find one naturally, let's try to find QuickActions which we also modified
        print("EmptyState not found, checking QuickActions")

        # QuickActions is likely fixed position
        quick_actions_fab = page.get_by_label("Open Quick Actions")
        if quick_actions_fab.is_visible():
            quick_actions_fab.click()
            page.wait_for_timeout(500)
            page.screenshot(path="verification/quick_actions_open.png")

            # Test Escape key
            page.keyboard.press("Escape")
            page.wait_for_timeout(500)
            page.screenshot(path="verification/quick_actions_closed.png")

if __name__ == "__main__":
    os.makedirs("verification", exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        try:
            verify_empty_state(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
