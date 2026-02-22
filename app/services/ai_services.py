import os
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash-lite")


# ---------------------------
# Extract Instagram Shortcode
# ---------------------------
def get_shortcode(url: str):
    url = url.split("?")[0]
    parts = url.strip("/").split("/")
    return parts[-1]


# ---------------------------
# Extract Caption via Embed
# ---------------------------
def extract_instagram_caption(url: str):
    try:
        shortcode = get_shortcode(url)

        embed_url = f"https://www.instagram.com/p/{shortcode}/embed/captioned/"

        headers = {
            "User-Agent": "Mozilla/5.0"
        }

        response = requests.get(embed_url, headers=headers, timeout=10)

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


# ---------------------------
# Gemini Analysis (KEEPING YOUR PROMPT)
# ---------------------------
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

    In the summary, add 1-2 emojis which are relatable and bold the important words, and 
    the bold words should look clean and no asterisks should be visible.

    Respond EXACTLY in this format:

    Category: <one category from list>

    Summary: <short summary> 

    It is Saved Now!! 🥳
    """

    response = model.generate_content(prompt)
    return response.text


# ---------------------------
# MAIN FUNCTION FOR WEBHOOK
# ---------------------------
async def process_instagram_link(link: str):

    caption = extract_instagram_caption(link)

    if not caption:
        return "Category: Other\nSummary: Could not extract caption from the reel."

    result = analyze_caption(caption)

    return result