import os
import google.generativeai as genai
from dotenv import load_dotenv

from playwright.async_api import sync_playwright

def extract_instagram_caption(url: str):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.goto(url, timeout=60000)
        
        page.wait_for_timeout(3000)

        spans = page.locator('span').all_text_contents()

        browser.close()

        text = " ".join(spans)

        return text


load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')

genai.configure(api_key=api_key)

model = genai.GenerativeModel('gemini-2.5-flash')

def analyze_instagram_link(link):
    prompt = f"""
    Analyze this Instagram link: {link}

    1. Guess the most likely category from:
       Fitness, Coding, Food, Travel, Design, Business, Other

    2. Write a short 1 sentence summary.

    Respond strictly in this format:

    Category: <category>
    Summary: <summary>
    """

    response = model.generate_content(prompt)
    return response.text