import asyncio
import sys

if sys.platform.startswith('win'):
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from fastapi import FastAPI
from app.routes.webhook import router as webhook_router
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

app.include_router(webhook_router)

@app.get('/')
def home():
    return {"message": "Welcome to Social Saver Bot"}