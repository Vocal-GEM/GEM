from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page(viewport={"width": 1280, "height": 800})
    page.goto("http://localhost:3000/")

    # Wait for the app to initialize
    page.wait_for_timeout(3000)

    # Bypass onboarding if it's there
    try:
        skip_button = page.get_by_role('button', name='Skip Tour')
        if skip_button.is_visible():
            skip_button.first.click(force=True)
            page.wait_for_timeout(500)
    except:
        pass

    # Open settings or QuickActions where we might find the Accessibility Panel
    try:
        page.evaluate("window.dispatchEvent(new CustomEvent('openSettings'))")
        page.wait_for_timeout(1000)
    except:
        pass

    page.screenshot(path="verification/toast_verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
