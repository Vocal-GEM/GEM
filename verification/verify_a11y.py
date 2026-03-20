import re
from playwright.sync_api import Page, expect, sync_playwright

def verify_a11y(page: Page):
    page.goto("http://localhost:3000/practice", wait_until="networkidle")

    # The tour overlay often intercepts clicks, so we skip it
    page.evaluate("() => { document.querySelectorAll('button').forEach(b => { if(b.textContent === 'Skip Tour') b.click() }) }")
    page.wait_for_timeout(1000)

    # We navigate to Pitch Mode to see PitchVisualizer
    try:
        pitch_tab = page.get_by_role("button", name="Switch to Pitch")
        pitch_tab.click()
    except Exception as e:
        print("Could not switch to Pitch tab, maybe already there?", e)

    page.wait_for_timeout(1000)

    # Check for our added aria-labels
    content = page.content()

    assert 'aria-label="Reset Average"' in content, "Reset Average aria-label missing"
    assert 'aria-label="Zoom In"' in content, "Zoom In aria-label missing"
    assert 'aria-label="Zoom Out"' in content, "Zoom Out aria-label missing"
    assert 'aria-label="Toggle Gender Timeline"' in content, "Toggle Gender Timeline aria-label missing"
    # Close Gender Timeline might not be in DOM until opened
    # Help with unstable signal might not be in DOM until triggered

    print("PitchVisualizer aria-labels found successfully in DOM.")

    page.screenshot(path="/app/verification/a11y_pitch.png")

    # Try to switch to HighResSpectrogram by going to Spectrogram/Perception tab
    try:
        perception_tab = page.get_by_role("button", name="Switch to Perception")
        perception_tab.click()
    except Exception as e:
        print("Could not switch to Perception tab", e)

    page.wait_for_timeout(1000)

    # Switch to "High-Res" tab if there is one
    try:
        hr_tab = page.get_by_role("button", name="High-Res")
        if hr_tab.is_visible():
            hr_tab.click()
    except Exception as e:
        pass

    page.wait_for_timeout(1000)

    content = page.content()
    # Check for HighResSpectrogram aria-labels
    # The controls might only show on hover, so we just check if it's rendered or not.
    # Actually, showControls is default true in HighResSpectrogram, so Camera button should be there.
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
