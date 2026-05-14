const crypto = require('crypto');
const axios = require('axios');
const seller=require('./models/userModel')
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

async function sendOTPMessage(to, otp) {
    try {
        const url = 'https://api.sms-gate.app/3rdparty/v1/message';

        const payload = {
            textMessage: {
                text: `Your OTP code is: ${otp}` // Dynamic text
            },
            phoneNumbers: [to] // Dynamic phone number
        };

        const response = await axios.post(url, payload, {
            auth: {
                username: process.env.OTP_SERVER_USER, // Recommended to use .env
                password: process.env.OTP_SERVER_PASSWORD 
            }
        });

        console.log('Cloud OTP Server Response:', response.data);
    } catch (error) {
        console.error('OTP Send Error:', error.response ? error.response.data : error.message);
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
//get transer_recipient form seller phone no            
           
            if (event === 'charge.success') {
                const sellerPhone = data.metadata?.whatsapp_number;
                const customerPhone=data.metadata?.customer_phone
                const itemName = data.metadata?.item_name;
                const otp = data.metadata?.otp_code;
                const reference = data.reference;
                const amount = data.amount / 100; // Convert kobo to Naira
                 const recipientcode=seller.getTransferRecipientCode(sellerPhone)

                if (sellerPhone) {
                    const messageText = `✅ *Payment Received!*\n\nRef: ${reference}\nItem: ${itemName}\nAmount: ₦${amount.toLocaleString()}`;
                    await sendWhatsAppMessage(sellerPhone, messageText);
                }

                if(customerPhone){
                    await sendOTPMessage(customerPhone,otp)
                }
            }
            res.sendStatus(200);
    };

    module.exports = { handleWebhook };