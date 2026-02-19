from fastapi import APIRouter, Form
from fastapi.responses import JSONResponse

router = APIRouter()

@router.post('/webhook')
async def receive_message(
    Body: str = Form(...),
    From: str = Form(...),
):
    print("Message:", Body)
    print("From:", From)

    reply = f"Got your message: {Body}"

    twiml = f"""
    <Response>
        <Message>{reply}</Message>
    </Response>
    """

    return Response(content=twiml, media_type="application/xml")