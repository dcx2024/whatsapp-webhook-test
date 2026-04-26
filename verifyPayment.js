const crypto = require('crypto');
const axios = require('axios');

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
                Authorization: `Bearer ${process.env.WHATSAPP_SECRET}`, // Use .env 
                "Content-Type": "application/json",
            },
        });
    } catch (err) {
        console.error("WhatsApp Send Error:", err.response?.data || err.message);
    }
}

const handleWebhook = async (req, res) => {
    const signature = req.headers['x-paystack-signature'];
    const secret = process.env.PAYSTACK_SECRET_KEY; // Use .env 

    const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');

    if (hash !== signature) {
        return res.status(401).send('Invalid Signature');
    }

    const { event, data } = req.body;
    
    if (event === 'charge.success') {
        const customerPhone = data.metadata?.whatsapp_number;
        const itemName = data.metadata?.item_name;
        const otp=data.metadata?.otp_code;
        const reference = data.reference;
        const amount = data.amount / 100; // Convert kobo to Naira

        if (customerPhone) {
            const messageText = `✅ *Payment Received!*\n\nRef: ${reference}\nItem: ${itemName}\nAmount: ₦${amount.toLocaleString()} This i syour otp ${otp}`;
            await sendWhatsAppMessage(customerPhone, messageText);
        }
    }
    res.sendStatus(200);
};

module.exports = { handleWebhook };