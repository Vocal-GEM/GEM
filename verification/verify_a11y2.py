import re
from playwright.sync_api import Page, expect, sync_playwright

def verify_a11y(page: Page):
    page.goto("http://localhost:3000/practice", wait_until="networkidle")

    # We will simulate the click using page.evaluate to bypass pointer event intercepts
    try:
        page.evaluate("() => { document.querySelector('button[aria-label=\"Switch to Pitch\"]').click() }")
    except Exception as e:
        print("Could not switch to Pitch tab, maybe already there?", e)

    page.wait_for_timeout(2000)

    # Check for our added aria-labels
    content = page.content()

    # Dump the content and check with grep
    with open('/app/verification/dom_content.html', 'w') as f:
        f.write(content)

    assert 'aria-label="Reset Average"' in content, "Reset Average aria-label missing"
    assert 'aria-label="Zoom In"' in content, "Zoom In aria-label missing"
    assert 'aria-label="Zoom Out"' in content, "Zoom Out aria-label missing"
    assert 'aria-label="Toggle Gender Timeline"' in content, "Toggle Gender Timeline aria-label missing"

    print("PitchVisualizer aria-labels found successfully in DOM.")

    page.screenshot(path="/app/verification/a11y_pitch.png")

    # Switch to "Perception" tab
    try:
        page.evaluate("() => { document.querySelector('button[aria-label=\"Switch to Perception\"]').click() }")
    except Exception as e:
        print("Could not switch to Perception tab", e)

    page.wait_for_timeout(2000)

    # Switch to "High-Res" tab if there is one
    try:
        page.evaluate("() => { const tabs = Array.from(document.querySelectorAll('button')); const hr = tabs.find(t => t.textContent.includes('High-Res')); if(hr) hr.click() }")
    except Exception as e:
        pass

    page.wait_for_timeout(2000)

    content = page.content()
    with open('/app/verification/dom_content2.html', 'w') as f:
        f.write(content)

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
