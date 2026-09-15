const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const axios = require('axios'); // Added missing import
require('dotenv').config();
const order = require('../models/orderModel')
const user=require('../models/userModel')


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
            console.log(from);
            
            if (message?.type === 'text') {
                const userText = message.text.body.trim();

                if (userText.toLowerCase().startsWith('create order:')) {
                    // Extract everything after "create order:"
                    const payload = userText.substring(13).trim();
                    const parts = payload.split(',');

                    // We need at least 1 item, 1 price, and 1 buyer (minimum 3 parts)
                    if (parts.length < 3) {
                        return await sendWhatsAppMessage(from, "Invalid format. Use: create order: item1, item2, total_price, Buyer:phonenumber");
                    }

                    // Extract from the END of the array
                    const buyerPart = parts.pop().trim(); // Gets the last item (Buyer:phone)
                    const price = parts.pop().trim();     // Gets the second to last item (Price)
                    
                    // Everything left in the array is the items. Join them back with commas.
                    const item = parts.join(', ').trim(); 

                    const buyerSplit = buyerPart.split(':');

                    if (buyerSplit.length !== 2 || buyerSplit[0].toLowerCase().trim() !== 'buyer') {
                        return await sendWhatsAppMessage(from, "Invalid Buyer format. Ensure it ends with, Buyer:[phonenumber]");
                    }

                    const rawPhoneNumber = buyerSplit[1].trim();
                    let formattedCustomerNumber = rawPhoneNumber;
                    if (formattedCustomerNumber.startsWith('0')) {
                        formattedCustomerNumber = '234' + formattedCustomerNumber.substring(1);
                    }

                    if (!price || isNaN(price)) {
                        return await sendWhatsAppMessage(from, "Invalid format. Price must be a valid number.");
                    }

                    const paymentToken = jwt.sign({
                        amount: price,
                        item: item,
                        whatsapp_number: from
                    }, JWT_SECRET, { expiresIn: '30m' });

                    let currentSeller = await user.getSellerId(from);
                    
                    // CRITICAL: You must 'return' here to stop execution if the seller is not found.
                    if (!currentSeller) {
                        console.log("Seller not found. Cannot create order.");
                        return await sendWhatsAppMessage(from, "Your phone number is not registered as a seller. Please register first.");
                    }
                    
                    const newOrder = await order.create({
                        amount: price,
                        item: item, // This will now save as "ps5, fifa 24, extra controller"
                        customer_phone_no: formattedCustomerNumber,
                        status: 'pending',
                        seller_id: currentSeller.id
                    });

                    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
                    const paymenturl = `${frontendUrl}/checkout?token=${paymentToken}`;

                    const customerMessage = `Your invoice for ${item} is ready. Total: ₦${price}. Pay here: ${paymenturl}`;
                    const senderMessage = `✅ Order created successfully!\n\nItems: ${item}\nInvoice sent to: ${rawPhoneNumber}\n\nLink: ${paymenturl}`;

                    await sendWhatsAppMessage(formattedCustomerNumber, customerMessage);
                    await sendWhatsAppMessage(from, senderMessage);
                }
            }
        }
    } catch (error) {
        console.error("Webhook processing error:", error.message);
    }
};

module.exports = { whatsappChallenge, messageListener };
