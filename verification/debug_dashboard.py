from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:3000")
        page.wait_for_selector('main', timeout=10000)

        # Screenshot the dashboard
        page.screenshot(path="verification/dashboard_debug.png")
        print("Dashboard screenshot saved.")

        # Print page text to see what's visible
        print(page.inner_text("body"))

        browser.close()

if __name__ == "__main__":
    run()
