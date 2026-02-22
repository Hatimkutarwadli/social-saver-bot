import random
import requests
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database.db import links_collection
from collections import defaultdict
from datetime import datetime, timedelta
from bson.objectid import ObjectId

router = APIRouter()

# Temporary in-memory OTP store
otp_store = {}


# ==============================
# Schemas
# ==============================

class PhoneSchema(BaseModel):
    phone: str


class VerifySchema(BaseModel):
    phone: str
    otp: str


# ==============================
# Send OTP
# ==============================

@router.post("/send-otp")
async def send_otp(data: PhoneSchema):

    phone = "".join(filter(str.isdigit, data.phone))

    if not phone:
        raise HTTPException(status_code=400, detail="Invalid phone number")

    otp = str(random.randint(100000, 999999))

    otp_store[phone] = otp

    print(f"Generated OTP for {phone}: {otp}")

    # Send OTP through WhatsApp bot
    try:
        requests.post(
            "http://127.0.0.1:3001/send-otp",
            json={
                "phone": phone,
                "otp": otp
            }
        )
    except Exception as e:
        print("Failed to send OTP via bot:", e)
        raise HTTPException(status_code=500, detail="Failed to send OTP")

    return {"message": "OTP sent successfully"}


# ==============================
# Verify OTP
# ==============================

@router.post("/verify-otp")
async def verify_otp(data: VerifySchema):

    phone = "".join(filter(str.isdigit, data.phone))

    if phone not in otp_store:
        raise HTTPException(status_code=400, detail="OTP not requested")

    if otp_store[phone] != data.otp:
        raise HTTPException(status_code=401, detail="Invalid OTP")

    # Remove OTP after successful verification
    del otp_store[phone]

    # Fetch user links
    user_links = list(
        links_collection.find({"user": phone})
    )

    grouped = defaultdict(list)

    for link in user_links:
        category = "Other"
        if "Category:" in link["ai_result"]:
            category = link["ai_result"].split("\n")[0].replace("Category: ", "").strip()
        link["_id"] = str(link["_id"])
        grouped[category].append(link)

    return {
        "phone": phone,
        "total_links": len(user_links),
        "categories": grouped
    }

@router.delete("/delete-link/{link_id}")
async def delete_link(link_id: str):

    result = links_collection.delete_one({"_id": ObjectId(link_id)})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Link not found")

    return {"message": "Deleted successfully"}