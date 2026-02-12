from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 720})

    # Navigate to the app
    page.goto("http://localhost:3000/")

    # Wait for the app to load
    page.wait_for_selector("body")

    # Press Ctrl+K to open Command Palette
    page.keyboard.press("Control+k")

    # Wait for the Command Palette to be visible
    palette = page.get_by_role("dialog", name="Command Palette")
    palette.wait_for(state="visible")

    # Verify SVG count in footer
    # Footer has class border-t and contains the icons
    # We expect 3 icons: ArrowUp, ArrowDown, CornerDownLeft
    footer = palette.locator("div.border-t")
    svgs = footer.locator("svg")
    count = svgs.count()
    print(f"SVG count in footer: {count}")

    if count == 3:
        print("SUCCESS: 3 icons found in footer")
    else:
        print(f"FAILURE: Expected 3 icons, found {count}")

    # Take a full page screenshot
    page.screenshot(path="verification/full_page_palette.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
