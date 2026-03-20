from playwright.sync_api import Page, expect, sync_playwright

def verify_a11y(page: Page):
    # Try the Spectrogram tab instead
    page.goto("http://localhost:3000/practice", wait_until="networkidle")

    page.evaluate("() => { const tour = document.querySelector('button.skip-tour'); if(tour) tour.click(); }")

    # Switch to "Perception" tab
    try:
        page.evaluate("() => { document.querySelector('button[aria-label=\"Switch to Perception\"]').click() }")
    except Exception as e:
        print("Could not switch to Perception tab", e)

    page.wait_for_timeout(2000)

    # Let's dump all buttons in the perception tab
    content = page.content()
    with open('/app/verification/dom_content3.html', 'w') as f:
        f.write(content)

    print("Checking HighResSpectrogram")
    assert 'aria-label="Save Screenshot"' in content, "Save Screenshot aria-label missing"

    print("HighResSpectrogram aria-labels found successfully in DOM.")

    page.screenshot(path="/app/verification/a11y_spectrogram.png")


if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Grant microphone permissions because it's a voice app
        context = browser.new_context(permissions=['microphone'])
        page = context.new_page()
        try:
            verify_a11y(page)
            print("Verification successful!")
        finally:
            browser.close()
