from playwright.sync_api import sync_playwright

def verify_toast():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Navigate to the app (assuming it's running on port 5173, default for Vite often, but README said 3000)
            # I'll try 3000 first, if fail try 5173.
            # Actually, I can check the logs.
            page.goto("http://localhost:5173") # Vite default is usually 5173

            # Wait for the toast to appear
            # The toast has text "Verification Toast"
            toast = page.get_by_text("Verification Toast")
            toast.wait_for(timeout=20000)

            # Take a screenshot
            page.screenshot(path="/home/jules/verification/verification.png")
            print("Screenshot taken.")

        except Exception as e:
            print(f"Error: {e}")
            # Take a screenshot of the error state if possible
            try:
                page.screenshot(path="/home/jules/verification/error.png")
            except:
                pass
        finally:
            browser.close()

if __name__ == "__main__":
    verify_toast()
