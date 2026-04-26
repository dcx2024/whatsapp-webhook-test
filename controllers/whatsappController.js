const crypto = require('node:crypto')
const jwt = require('jsonwebtoken')
require('dotenv').config();
const { initializeTransaction } = require('../payment')
const JWT_SECRET=process.env.JWT_SECRET;
const verifyToken = process.env.VERIFY_TOKEN;

const whatsappChallenge = async (req, res) => {
    const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

    if (mode === 'subscribe' && token === verifyToken) {
        console.log('WEBHOOK VERIFIED');
        res.status(200).send(challenge);
    } else {
        res.status(403).end();
    }
};

async function sendWhatsAppMessage(to, text) {
    try {
        await axios({
            method: "POST",
            url: `https://graph.facebook.com/v18.0/1033168876553714/messages`,
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
    try {
        const body = req.body;

        if (body.object === 'whatsapp_business_account') {
            const entry = body.entry?.[0]?.changes?.[0]?.value;
            const message = entry?.messages?.[0];
            const from = message?.from;

            if (message?.type === 'text') {
                const userText = message.text.body.trim();

                if (userText.startsWith('/invoice')) {
                    const parts = userText.split(' ');
                    const price = parts[1];
                    const item = parts.slice(2).join(' ') || "Product";

                    const paymentToken = jwt.sign({
                        amount: price,
                        item: item,
                        phone: from // Added phone to token so you can use it later
                    }, JWT_SECRET, { expiresIn: '30m' });

                    // CHANGE THIS TO YOUR ACTUAL FRONTEND URL ONCE DEPLOYED
                    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
                    const paymenturl = `${frontendUrl}/checkout?token=${paymentToken}`;

                    await sendWhatsAppMessage(from, `Your invoice for ${item} is ready. Total: ₦${price}. Pay here: ${paymenturl}`);
                }
            }
        }
        // CRITICAL: Always respond to Meta immediately
        res.sendStatus(200);
    } catch (error) {
        console.error("Webhook Error:", error);
        // Still send 200 so Meta doesn't disable your webhook
        res.sendStatus(200); 
    }

        
      
}

module.exports = { whatsappChallenge, messageListener }


