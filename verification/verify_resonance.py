
from playwright.sync_api import sync_playwright

def verify_resonance_metrics():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a mobile viewport to match many use cases
        context = browser.new_context(viewport={'width': 375, 'height': 812})
        page = context.new_page()

        try:
            # Navigate to a page where ResonanceMetrics might be visible.
            # Assuming it's on a dashboard or analysis page.
            # Based on file names, it might be in 'viz' section or dashboard.
            # I'll try the root first, as many dashboards are there.
            page.goto("http://localhost:3000")

            # Wait for the app to load
            page.wait_for_timeout(5000)

            # Take a screenshot of the initial state
            page.screenshot(path="verification/dashboard.png")
            print("Screenshot saved to verification/dashboard.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_resonance_metrics()
