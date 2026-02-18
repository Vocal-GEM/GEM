from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Set viewport to ensure consistent rendering
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        try:
            print("Navigating to Practice View...")
            page.goto('http://localhost:3000/practice')

            # Wait for any potential tour modal
            # The screenshot shows "Skip Tour" button in a modal.
            # We can try to find it.
            try:
                print("Checking for tour...")
                skip_tour = page.get_by_role("button", name="Skip Tour").first
                if skip_tour.is_visible(timeout=5000):
                    print("Found Skip Tour button, clicking...")
                    skip_tour.click()
                    page.wait_for_timeout(1000)
                else:
                    print("Skip Tour button not visible within timeout.")
            except Exception as e:
                print(f"Tour check exception: {e}")

            # Also check for "Next" button, maybe multiple steps
            # Or close button 'X'

            # Now look for "Show Tools" button
            print("Looking for 'Show Tools' button...")
            show_tools = page.get_by_role("button", name="Show Tools").first

            # If not found, maybe look for text
            if not show_tools.is_visible():
                print("'Show Tools' role button not found. Searching by text...")
                show_tools = page.locator("button", has_text="Show Tools").first

            if show_tools.is_visible():
                print("Clicking Show Tools...")
                show_tools.click()
                page.wait_for_timeout(1000)

                # Now the drawer should be open.
                # Look for "Spectrogram" toggle button in the drawer.
                print("Looking for Spectrogram toggle...")
                spectrogram_toggle = page.get_by_role("button", name="Spectrogram").first

                if spectrogram_toggle.is_visible():
                    print("Clicking Spectrogram toggle...")
                    spectrogram_toggle.click()
                    page.wait_for_timeout(2000)

                    # Take success screenshot
                    print("Taking success screenshot...")
                    page.screenshot(path='verification/spectrogram_verification.png', full_page=True)
                    print("Success screenshot saved.")
                else:
                    print("Spectrogram toggle not found!")
            else:
                print("'Show Tools' button could not be found.")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            page.screenshot(path='verification/final_state.png')
            browser.close()

if __name__ == '__main__':
    run()
