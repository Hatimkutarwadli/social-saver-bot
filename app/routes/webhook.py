from fastapi import APIRouter, Form
from fastapi.responses import Response
import re
from app.services.ai_services import analyze_instagram_link

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
        print("Instagram Link detected", link)

        ai_result = analyze_instagram_link(link)
        reply = f"Saved!\n\n{ai_result}"
    else:
        reply = "Please send a valid Instagram Link."

    twiml = f"""
    <Response>
        <Message>{reply}</Message>
    </Response>
    """

    return Response(content=twiml, media_type="application/xml")