from playwright.sync_api import Page, expect, sync_playwright
import json
import time

def verify_voice_quality_meter(page: Page):
    # Set localStorage to bypass tours
    page.goto("http://localhost:3000")

    page.evaluate("""() => {
        localStorage.setItem('gem_voice_profile_onboarding_done', 'true');
        localStorage.setItem('gem_tutorial_seen', 'true');
        localStorage.setItem('gem_compass_seen', 'true');
        localStorage.setItem('gem_calibration_done', 'true');
        localStorage.setItem('gem_completed_tours', JSON.stringify(["dashboard", "practice_mode", "spectrogram"]));
    }""")

    page.reload()

    # Wait for navigation to settle
    time.sleep(2)

    # Navigate to Practice Mode if not already there
    # Check if "Practice" link exists in sidebar
    practice_link = page.get_by_role("button", name="Practice", exact=True)
    if practice_link.is_visible():
        practice_link.click()

    # Wait for Practice Mode to load
    # It might take a moment to switch views
    expect(page.get_by_text("Overview")).to_be_visible(timeout=10000)

    # Switch to Weight tab
    weight_tab = page.get_by_role("button", name="Weight")
    weight_tab.click()

    # Verify VoiceQualityMeter is present
    # It has text "Vocal Weight" or "Heavy"
    # We look for "Heavy / Pressed" which is in the labels I restored
    expect(page.get_by_text("Heavy / Pressed")).to_be_visible(timeout=10000)

    # Take screenshot
    time.sleep(1)
    page.screenshot(path="verification/voice_quality_meter.png")
    print("Screenshot saved to verification/voice_quality_meter.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_voice_quality_meter(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_vqm.png")
        finally:
            browser.close()
