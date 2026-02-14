from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()

        # Bypass onboarding
        context.add_init_script("""
            localStorage.setItem('gem_voice_profile_onboarding_done', 'true');
            localStorage.setItem('gem_tutorial_seen', 'true');
            localStorage.setItem('gem_compass_seen', 'true');
            localStorage.setItem('gem_calibration_done', 'true');
            localStorage.setItem('gem_tour_completed', 'true');
        """)

        page = context.new_page()

        try:
            # 1. Navigate to the app
            print("Navigating to app...")
            page.goto("http://localhost:3000")
            page.wait_for_load_state("networkidle")

            # Handle overlays
            def clear_overlays():
                print("Clearing overlays...")
                try:
                    page.evaluate("""
                        document.querySelectorAll('.fixed.inset-0').forEach(el => {
                            if (window.getComputedStyle(el).zIndex >= 50) {
                                if (el.querySelector('form')) return; // Don't remove JournalForm
                                el.style.display = 'none';
                            }
                        });
                        document.querySelectorAll('[class*="z-[9999]"]').forEach(e => e.remove());
                    """)
                except:
                    pass

            clear_overlays()

            # 2. Use Sidebar Search to navigate to History
            print("Searching for History...")
            try:
                # Sidebar search input
                page.click("input[placeholder*='Search']", force=True)
                page.fill("input[placeholder*='Search']", "History")

                # Wait for results
                print("Waiting for search results...")
                page.wait_for_selector("text=View past sessions and journals", timeout=5000)

                # Click the result
                print("Clicking History result...")
                page.click("text=View past sessions and journals", force=True)
            except Exception as e:
                print(f"Sidebar search failed: {e}")


            # 4. Wait for History View
            print("Waiting for History View...")
            page.wait_for_selector("button:has-text('Journals')", state="visible")

            clear_overlays() # Clear again as new view might spawn tour

            # 5. Click Journals tab
            print("Clicking Journals tab...")
            page.click("button:has-text('Journals')", force=True)

            # 6. Click Log Session button
            print("Clicking Log Session...")
            try:
                page.click("button:has-text('Log Session')", force=True)
            except:
                print("Log Session button not found, trying Create First Entry")
                page.click("button:has-text('Create First Entry')", force=True)

            # 7. Wait for JournalForm
            print("Waiting for JournalForm...")
            form = page.wait_for_selector("form", state="visible")
            page.wait_for_selector("text=Log Practice Session", state="visible")

            # Scroll down
            print("Scrolling form...")
            # We can scroll the form container or just try to scroll to the Save button
            save_btn = page.locator("button:has-text('Save Log')")
            save_btn.scroll_into_view_if_needed()

            # 8. Take screenshot
            print("Taking screenshot...")
            page.screenshot(path="verification/journal_form.png")

            print("Verification complete!")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    run()
