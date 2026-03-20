from playwright.sync_api import Page, expect, sync_playwright

def verify_a11y(page: Page):
    # Try the new Advanced Practice View instead
    page.goto("http://localhost:3000/practice", wait_until="networkidle")

    # We navigate to the SLP dashboard or similar where high res spectrogram is
    try:
        page.evaluate("() => { document.querySelector('button[aria-label=\"Switch to Overview\"]').click() }")
    except Exception as e:
        print("Could not switch to Overview tab", e)

    page.wait_for_timeout(2000)

    # Let's dump the dom
    content = page.content()
    with open('/app/verification/dom_content4.html', 'w') as f:
        f.write(content)

    print("Checking HighResSpectrogram")
    if 'aria-label="Save Screenshot"' in content:
        print("Save Screenshot aria-label found in DOM!")
    else:
        print("Not found in DOM")

    page.screenshot(path="/app/verification/a11y_spectrogram.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Grant microphone permissions because it's a voice app
        context = browser.new_context(permissions=['microphone'])
        page = context.new_page()
        try:
            verify_a11y(page)
            print("Verification completed")
        finally:
            browser.close()
