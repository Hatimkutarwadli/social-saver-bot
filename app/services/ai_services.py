import os
import google.generativeai as genai
from dotenv import load_dotenv

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