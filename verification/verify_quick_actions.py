from playwright.sync_api import sync_playwright

def verify_quick_actions():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Bypass onboarding
        page.add_init_script("""
            localStorage.setItem('gem_voice_profile_onboarding_done', 'true');
            localStorage.setItem('gem_tutorial_seen', 'true');
            localStorage.setItem('gem_compass_seen', 'true');
            localStorage.setItem('gem_calibration_done', 'true');
            localStorage.setItem('hasVisited', 'true');
        """)

        print("Navigating to home...")
        page.goto("http://localhost:3000")

        # Try to skip tour if present
        try:
            skip_btn = page.get_by_role("button", name="Skip Tour")
            if skip_btn.is_visible(timeout=3000):
                print("Skipping tour...")
                skip_btn.click()
        except:
            print("No tour skip button found.")

        # Try to close tour overlay
        try:
            close_btn = page.get_by_label("Close")
            if close_btn.count() > 0:
                print("Closing modals...")
                for btn in close_btn.all():
                    if btn.is_visible():
                        btn.click()
        except:
            pass

        # Wait for the FAB to be visible
        print("Waiting for Quick Actions FAB...")
        fab = page.get_by_role("button", name="Open Quick Actions")
        try:
            fab.wait_for(state="visible", timeout=10000)
        except:
            print("FAB not found or not visible. Taking error screenshot.")
            page.screenshot(path="verification/error.png")
            raise

        # Click it
        print("Clicking FAB...")
        fab.click()

        # Wait for menu items
        print("Waiting for menu items...")
        menu = page.get_by_role("region", name="Quick Actions Menu")
        practice_btn = menu.get_by_role("button", name="Practice")
        practice_btn.wait_for(state="visible")

        # Take screenshot
        print("Taking screenshot...")
        page.screenshot(path="verification/quick_actions.png")

        browser.close()
        print("Done!")

if __name__ == "__main__":
    verify_quick_actions()
