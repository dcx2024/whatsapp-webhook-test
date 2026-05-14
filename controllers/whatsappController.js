const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const axios = require('axios'); // Added missing import
require('dotenv').config();

const { initializeTransaction } = require('../payment');

const JWT_SECRET = process.env.JWT_SECRET;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

const whatsappChallenge = async (req, res) => {
    const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('WEBHOOK VERIFIED');
        return res.status(200).send(challenge);
    }
    return res.status(403).end();
};

async function sendWhatsAppMessage(to, text) {
    try {
        await axios({
            method: "POST",
            url: `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`, // Use env for ID
            data: {
                messaging_product: "whatsapp",
                to: to,
                text: { body: text },
            },
            headers: {
                Authorization: `Bearer ${process.env.WHATSAPP_SECRET}`,
                "Content-Type": "application/json",
            },
        });
    } catch (err) {
        console.error("WhatsApp Send Error:", err.response?.data || err.message);
    }
}

const messageListener = async (req, res) => {
    // Send 200 immediately to prevent Meta timeouts
    res.sendStatus(200);

    try {
        const body = req.body;

        if (body.object === 'whatsapp_business_account') {
            const entry = body.entry?.[0]?.changes?.[0]?.value;
            const message = entry?.messages?.[0];
            const from = message?.from;
                console.log(from)
            if (message?.type === 'text') {
                const userText = message.text.body.trim();

                if (userText.startsWith('/invoice')) {
                    const parts = userText.split(' ');
                    const price = parts[1];
                    const item = parts.slice(2).join(' ') || "Product";

                    if (!price || isNaN(price)) {
                        return await sendWhatsAppMessage(from, "Invalid format. Use: /invoice [amount] [item]");
                    }

                    const paymentToken = jwt.sign({
                        amount: price,
                        item: item,
                        whatsapp_number: from 
                    }, JWT_SECRET, { expiresIn: '30m' });

                    // Use FRONTEND_URL from env, fallback to localhost for dev
                    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
                    const paymenturl = `${frontendUrl}/checkout?token=${paymentToken}`;

                    await sendWhatsAppMessage(from, `Your invoice for ${item} is ready. Total: ₦${price}. Pay here: ${paymenturl}`);
                }
            }
        }
    } catch (error) {
        console.error("Webhook processing error:", error.message);
    }
};

module.exports = { whatsappChallenge, messageListener };
