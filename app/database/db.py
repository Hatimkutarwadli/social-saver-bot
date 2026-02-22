import os
from dotenv import load_dotenv
from pymongo import MongoClient
from datetime import datetime

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))

db = client["social-saver"]
links_collection = db["saved_links"]


def save_link(user, url, ai_result):

    user_digits = "".join(filter(str.isdigit, user))

    if not ai_result:
        ai_result = "Category: Other\nSummary: Processing failed."

    data = {
        "user": user_digits,
        "url": url,
        "ai_result": ai_result,
        "created_at": datetime.utcnow()
    }

    links_collection.insert_one(data)

    print("Saved to Mongo for user:", user_digits)