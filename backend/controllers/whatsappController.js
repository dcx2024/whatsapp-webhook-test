const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const axios = require('axios'); // Added missing import
require('dotenv').config();
const order = require('../models/orderModel')
const user = require('../models/userModel')
const bcrypt=require('bcrypt')




const { initializeTransaction } = require('../payment');

const JWT_SECRET = process.env.JWT_SECRET;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

const whatsappChallenge = async (req, res) => {
    const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('WEBHOOK VERIFIED');
        return res.status(200).send(challenge);
    }
    return res.status(403).end();
};


async function sendWhatsAppURLButton(to, bodyText, buttonText, buttonUrl) {
    try {
        await axios({
            method: "POST",
            url: `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`,
            data: {
                messaging_product: "whatsapp",
                to: to,
                type: "interactive",
                interactive: {
                    type: "cta_url",
                    // 1. ADD A HEADER (Bold text at the top)
                    header: {
                        type: "text",
                        text: "🧾 Payment Invoice"
                    },
                    // 2. YOUR MAIN TEXT
                    body: {
                        text: bodyText
                    },
                    // 3. ADD A FOOTER (Small grey text at the bottom)
                    footer: {
                        text: "Secure payment powered by your app"
                    },
                    // 4. THE BUTTON
                    action: {
                        name: "cta_url",
                        parameters: {
                            display_text: buttonText,
                            url: buttonUrl
                        }
                    }
                }
            },
            headers: {
                Authorization: `Bearer ${process.env.WHATSAPP_SECRET}`,
                "Content-Type": "application/json",
            },
        });
    } catch (err) {
        console.error("WhatsApp Send Button Error:", err.response?.data || err.message);
    }
}
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

function generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
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

                   // 1. Verify seller exists
                    let currentSeller = await user.getSellerId(from);
                    if (!currentSeller) {
                        return await sendWhatsAppMessage(from, "Your phone number is not registered as a seller. Please register first.");
                    }

                    // 2. Generate OTP and hash it for delivery confirmation
                    const otp = generateOTP();
                    const otp_hash = await bcrypt.hash(otp, 10);

                    // 3. Initialize Paystack Transaction directly
                    // Paystack requires an email. If the buyer doesn't provide one, use a placeholder.
                    const dummyEmail = `buyer_${formattedCustomerNumber}@guest.local`;
                    
                    const paystackParams = {
                        email: dummyEmail,
                        amount: parseFloat(price) * 100, // Convert to kobo/cents
                        metadata: {
                            item_name: item,
                            whatsapp_number: from,
                            customer_phone: formattedCustomerNumber,
                            otp_code: otp // You can send this via SMS/WhatsApp to the buyer later
                        }
                    };

                    const paystackRes = await initializeTransaction(PAYSTACK_SECRET_KEY, paystackParams);

                    if (!paystackRes.status) {
                        console.error("Paystack Init Error:", paystackRes);
                        return await sendWhatsAppMessage(from, "❌ Failed to generate payment link. Please try again later.");
                    }

                    // 4. Save order to the database with the Paystack reference
                    const newOrder = await order.create({
                        payment_ref: paystackRes.data.reference,
                        amount: parseFloat(price),
                        item: item,
                        customer_phone_no: formattedCustomerNumber,
                        otp_hash: otp_hash,
                        status: 'pending',
                        seller_id: currentSeller.id,
                        transfer_recipient: currentSeller.transfer_recipient
                    });

                    // 5. Send direct Paystack URL to the buyer and confirmation to the seller
                    const paymenturl = paystackRes.data.authorization_url;

                    const customerMessage = `Your invoice for ${item} is ready. Total: ₦${price}. Click the link to Pay:`;
                    const senderMessage = `✅ Order created successfully!\n\nItems: ${item}\nInvoice sent to: ${rawPhoneNumber}\n\nLink: ${paymenturl}`;

                    await sendWhatsAppURLButton(formattedCustomerNumber, customerMessage, "Pay Now", paymenturl);
                    await sendWhatsAppMessage(from, senderMessage);                }
            }
        }
    } catch (error) {
        console.error("Webhook processing error:", error.message);
    }
};

module.exports = { whatsappChallenge, messageListener };
