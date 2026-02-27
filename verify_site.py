from playwright.sync_api import sync_playwright
import os
import time

def test_deployment_learning_hub():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load the local index.html file
        cwd = os.getcwd()
        page.goto(f"file://{cwd}/index.html")

        # Verify the title
        print(f"Page Title: {page.title()}")

        # Print console logs to debug
        page.on("console", lambda msg: print(f"Console: {msg.text}"))

        # Wait for potential JS execution
        page.wait_for_timeout(2000)

        # Take a screenshot of the initial state
        page.screenshot(path="screenshot_initial.png")
        print("Initial screenshot taken.")

        # Check for buttons count
        count = page.locator("button").count()
        print(f"Buttons found: {count}")

        if count > 0:
            # Try to click the Role-Play button
            role_play_btn = page.locator("button").filter(has_text="Role-Play Scenario")
            if role_play_btn.count() > 0:
                role_play_btn.click()
                print("Clicked Role-Play Scenario")
                page.wait_for_selector(".role-play-container")
                page.screenshot(path="screenshot_roleplay.png")
            else:
                print("Role-Play button not found.")

            # Try Quiz
            quiz_btn = page.locator("button").filter(has_text="Quiz Generator")
            if quiz_btn.count() > 0:
                quiz_btn.click()
                print("Clicked Quiz Generator")
                page.wait_for_selector(".quiz-question")
                page.screenshot(path="screenshot_quiz.png")
        else:
            print("No buttons to click.")

        browser.close()

if __name__ == "__main__":
    test_deployment_learning_hub()
