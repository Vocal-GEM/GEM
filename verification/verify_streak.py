from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Go to app
    print("Navigating to app...")
    page.goto("http://localhost:3000")

    # Handle Tour if present
    print("Checking for Tour...")
    try:
        skip_btn = page.get_by_role("button", name="Skip Tour")
        if skip_btn.is_visible(timeout=5000):
            print("Skipping tour...")
            skip_btn.click()
    except:
        print("No tour found or timed out.")

    # Navigate to Dashboard via Sidebar
    print("Navigating to Dashboard...")
    # Use .first to avoid strict mode violation if duplicates exist (e.g. mobile/desktop)
    page.get_by_role("button", name="Dashboard").first.click()

    # Wait for Dashboard content
    print("Waiting for Dashboard content...")

    # Look for "Streak"
    try:
        # Check for the StatCard label "Streak"
        # It might be in a different language, but defaults to English
        expect(page.get_by_text("Current Streak")).to_be_visible(timeout=5000)
        print("Streak card found via 'Current Streak'!")
    except:
        try:
             expect(page.get_by_text("Streak")).to_be_visible(timeout=5000)
             print("Streak card found via 'Streak'!")
        except Exception as e:
             print(f"Error finding streak card: {e}")

    # Take screenshot
    page.screenshot(path="verification/dashboard_streak_final.png")
    print("Screenshot saved to verification/dashboard_streak_final.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
