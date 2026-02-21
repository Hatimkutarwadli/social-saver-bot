from fastapi import APIRouter, Form, HTTPException
from app.database.db import collection
from fastapi.responses import Response
import re

from app.services.ai_services import analyze_caption, extract_instagram_caption
from app.database.db import save_link

router = APIRouter()

@router.post('/webhook')
async def receive_message(
    Body: str = Form(...),
    From: str = Form(...),
):
    print("Message:", Body)
    print("From:", From)

    instagram_pattern = r"(https?://(?:www\.)?instagram\.com/[^\s]+)"

    match = re.search(instagram_pattern, Body)

    if match:
        link = match.group(0)

        caption = extract_instagram_caption(link)

        if not caption:
            reply = "Could not extract caption. Make sure post is public"
        else:
            ai_result = analyze_caption(caption)
            
            save_link(From, link, ai_result)

            reply = f"Saved!\n\n{ai_result}"

    twiml = f"""
    <Response>
        <Message>{reply}</Message>
    </Response>
    """

    return Response(content=twiml, media_type="application/xml")

@router.get('/links')
async def get_links():
    try:
        data = list(collection.find({}, {"_id": 0}))
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
