from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        print("Navigating to app...")
        try:
            page.goto("http://localhost:3000")
            # Wait a bit for react to hydrate
            page.wait_for_timeout(5000)

            print("Taking debug screenshot...")
            page.screenshot(path="verification/debug_home.png")

            # Print page title
            print(f"Page title: {page.title()}")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
