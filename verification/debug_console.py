from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Capture console logs
        page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
        page.on("pageerror", lambda err: print(f"PAGE ERROR: {err}"))

        page.goto("http://localhost:3000")

        # Wait a bit
        page.wait_for_timeout(5000)

        # Check if loading
        if page.get_by_text("Loading...").is_visible():
            print("Still loading...")
        else:
            print("Loaded!")

        browser.close()

if __name__ == "__main__":
    run()
