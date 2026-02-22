import random
import requests
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database.db import links_collection
from collections import defaultdict
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

    # Use BOT_URL from environment or fallback to localhost
    bot_url = os.getenv("BOT_URL", "http://127.0.0.1:3001")

    try:
        requests.post(
            f"{bot_url}/send-otp",
            json={"phone": phone, "otp": otp},
            timeout=5
        )
    except Exception as e:
        print("Failed to send OTP via bot:", e)
        raise HTTPException(status_code=500, detail="Failed to send OTP")

    return {"message": "OTP sent successfully"}


# ==============================
# Safe User Data Fetch
# ==============================

def get_user_data(phone: str):

    user_links = list(
        links_collection.find({"user": phone})
    )

    grouped = defaultdict(list)

    for link in user_links:

        ai_result = link.get("ai_result")

        if not ai_result:
            category = "Other"
            ai_result = "Category: Other\nSummary: Missing AI result."
        elif "Category:" in ai_result:
            category = ai_result.split("\n")[0].replace("Category: ", "").strip()
        else:
            category = "Other"

        link["_id"] = str(link["_id"])
        link["ai_result"] = ai_result

        grouped[category].append(link)

    return {
        "phone": phone,
        "total_links": len(user_links),
        "categories": dict(grouped)
    }


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

    del otp_store[phone]

    return get_user_data(phone)


# ==============================
# Direct Login (optional)
# ==============================

@router.post("/login")
async def login(data: PhoneSchema):

    phone = "".join(filter(str.isdigit, data.phone))

    if not phone:
        raise HTTPException(status_code=400, detail="Invalid phone number")

    return get_user_data(phone)


# ==============================
# Delete Link
# ==============================

@router.delete("/delete-link/{link_id}")
async def delete_link(link_id: str):

    result = links_collection.delete_one({"_id": ObjectId(link_id)})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Link not found")

    return {"message": "Deleted successfully"}