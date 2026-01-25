from playwright.sync_api import sync_playwright, expect
import os
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 1280, 'height': 720})
    page = context.new_page()

    try:
        # 1. Navigate to the app
        print("Navigating to http://localhost:3000")
        page.goto("http://localhost:3000")

        # Wait for app to load
        print("Waiting for app to load...")
        page.wait_for_selector("text=Vocal GEM", timeout=30000)

        # Handle Migration Modal (wait for it to disappear)
        print("Waiting for any migration modal to clear...")
        time.sleep(5)

        # Handle Onboarding "Skip Setup" if present
        try:
            skip_btn = page.get_by_role("button", name="Skip Setup")
            if skip_btn.is_visible():
                print("Clicking Skip Setup...")
                skip_btn.click()
                time.sleep(2)
        except:
            print("No Skip Setup button found.")

        # 2. Check for Quick Actions FAB
        print("Looking for Quick Actions FAB...")
        fab = page.get_by_label("Open Quick Actions")
        expect(fab).to_be_visible()

        # 3. Click FAB to expand
        print("Clicking FAB...")
        fab.click(force=True)

        # 4. Wait for animation
        time.sleep(1.0)

        # 5. Check items (scoped to menu)
        print("Checking menu items...")
        menu = page.get_by_role("region", name="Quick Actions Menu")
        expect(menu.get_by_label("Practice")).to_be_visible()
        expect(menu.get_by_label("Journal")).to_be_visible()
        expect(menu.get_by_label("Warm Up")).to_be_visible()

        # 6. Take screenshot
        os.makedirs("verification", exist_ok=True)
        page.screenshot(path="verification/quick_actions_open.png")
        print("Screenshot saved to verification/quick_actions_open.png")

    except Exception as e:
        print(f"Error: {e}")
        # Take error screenshot
        os.makedirs("verification", exist_ok=True)
        page.screenshot(path="verification/error.png")
        raise e
    finally:
        browser.close()

if __name__ == "__main__":
    with sync_playwright() as playwright:
        run(playwright)
