const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const axios = require("axios");
const express = require("express");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

console.log("Starting WhatsApp Bot...");

const findChrome = () => {
  const chromeDir = path.join(__dirname, "chrome");
  if (!fs.existsSync(chromeDir)) return null;

  // Search for the chrome binary recursively in the local folder
  const findBinary = (dir) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        const found = findBinary(fullPath);
        if (found) return found;
      } else if (file === "chrome" && fs.accessSync(fullPath, fs.constants.X_OK) === undefined) {
        return fullPath;
      }
    }
    return null;
  };

  try {
    return findBinary(chromeDir);
  } catch (err) {
    console.error("Error finding chrome binary:", err);
    return null;
  }
};

const executablePath = findChrome() || puppeteer.executablePath();
console.log("Using Chrome from:", executablePath);

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true, // Required for server deployment
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    executablePath: executablePath,
  },
});

const app = express();
app.use(express.json());

// Load backend URL from environment
const BACKEND_URL = process.env.BACKEND_URL || "https://social-saver-bot-tpyl.onrender.com";


// ==============================
// Health Check (For Render)
// ==============================
app.get("/health", (req, res) => {
  res.json({ status: "ok", whatsapp: client.info ? "ready" : "initializing" });
});

app.get("/", (req, res) => {
  res.send("Social Saver WhatsApp Bot is Running.");
});


// ==============================
// QR + Ready
// ==============================

client.on("qr", (qr) => {
  console.log("QR RECEIVED. Scan this in the Render logs!");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("WhatsApp Bot Ready");
});

client.on("disconnected", (reason) => {
  console.log("Client was logged out:", reason);
});


// ==============================
// OTP Endpoint (Backend calls this)
// ==============================

app.post("/send-otp", async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ error: "Missing phone or otp" });
  }

  try {
    if (!client.info) {
      console.log("Client not ready yet");
      return res.status(500).json({ error: "WhatsApp not ready" });
    }

    const formattedNumber = `${phone}@c.us`;

    // Small delay to avoid detached frame issue
    await new Promise(resolve => setTimeout(resolve, 1500));

    await client.sendMessage(
      formattedNumber,
      `🔐 Your Social Saver login OTP is: *${otp}*\n\nDo not share this with anyone.`
    );

    console.log("OTP sent to:", phone);

    res.json({ success: true });

  } catch (err) {
    console.error("OTP send error:", err);

    res.status(500).json({
      error: "Failed to send OTP",
      details: err.message
    });
  }
});


// ==============================
// Instagram Link Listener
// ==============================

client.on("message", async (message) => {
  try {
    if (message.fromMe) return;
    if (message.from.endsWith("@g.us")) return;
    if (message.from === "status@broadcast") return;
    if (message.from.includes("newsletter")) return;
    if (!message.body) return;

    const instagramRegex =
      /^https?:\/\/(www\.)?instagram\.com\/(reel|p)\/.+/;

    if (!instagramRegex.test(message.body)) return;

    console.log("Valid Instagram link:", message.body);

    const contact = await message.getContact();
    const phoneNumber = contact.number;

    const response = await axios.post(
      `${BACKEND_URL}/webhook`,
      {
        message: message.body,
        from_user: phoneNumber,
      }
    );

    await message.reply(response.data.ai_result);

  } catch (error) {
    console.error("Backend error:", error.message);
    await message.reply("Something went wrong.");
  }
});


// ==============================
// Start OTP Server
// ==============================

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Bot OTP server running on port ${PORT}`);
});

client.initialize();