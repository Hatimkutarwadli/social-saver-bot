import os
from dotenv import load_dotenv
from pymongo import MongoClient
from datetime import datetime

load_dotenv()

client = MongoClient(os.getenv('MONGO_URI'))

db = client["social-saver"]
collection = db['saved_links']

def save_link(user, url, ai_result):
    data = {
        'user': user,
        'url': url,
        'ai_result': ai_result,
        'created_at': datetime.utcnow()
    }
    collection.insert_one(data)
    print('saved to mongo')

