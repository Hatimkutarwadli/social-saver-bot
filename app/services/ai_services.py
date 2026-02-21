import os
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

def get_shortcode(url: str):
    url = url.split("?")[0]
    parts = url.strip("/").split("/")
    return parts[-1]

def extract_instagram_caption(url: str):
    try:
        shortcode = get_shortcode(url)

        embed_url = f"https://www.instagram.com/p/{shortcode}/embed/captioned/"

        headers = {
            "User-Agent": "Mozilla/5.0"
        }

        response = requests.get(embed_url, headers=headers)

        if response.status_code != 200:
            print("Embed fetch failed:", response.status_code)
            return None

        soup = BeautifulSoup(response.text, "html.parser")

        caption_div = soup.find("div", class_="Caption")

        if caption_div:
            caption = caption_div.get_text(strip=True)
            print("Extracted Caption:", caption)
            return caption

        print("Caption div not found")
        return None

    except Exception as e:
        print("Extraction error:", e)
        return None

def analyze_caption(text: str):

    prompt = f"""
    You are categorizing Instagram content.

    Caption:
    {text}

    Classify into ONE of these categories ONLY:
    Fitness, Coding, Food, Travel, Design, Business, Entertainment, Education, Lifestyle,
    Sports, Art, Music, Finance, Nature.

    Also detect emotional tone:
    Motivational, Informative, Funny, Promotional, Serious, Inspirational

    Pick the closest category even if not perfect.

    Then write a short 1 sentence summary.

    Respond EXACTLY in this format:

    Category: <one category from list>
    Summary: <short summary>
    """

    response = model.generate_content(prompt)
    return response.text