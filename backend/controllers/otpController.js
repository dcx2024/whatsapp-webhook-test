const bcrypt = require('bcrypt')
const order = require('../models/orderModel');
const { transfer, finalizeTransfer } = require('../payment');

const verifyOtp = async (req, res) => {
    try {
        const { otp, customerPhone } = req.body;
        
        // 1. Locate the pending escrow order
        const existing = await order.findByCustomerPhone(customerPhone)
        if (!existing) {
            return res.status(404).json({ message: "Order not found" })
        }
        console.log('escrow order exists')
        // 2. Authenticate the buyer's escrow release OTP
        const match = await bcrypt.compare(otp, existing.otp_hash)
        if (!match) {
            return res.status(400).json({ message: "Invalid or expired OTP entered" })
        }
        console.log('Payment release processed')
        // Convert the float amount safely into Kobo for Paystack
        const amountInKobo = Math.round(parseFloat(existing.amount) * 100);

        // 3. Define Paystack Transfer Parameters
        const transferParams = {
            "source": "balance",
            "reason": `Escrow payout for order #${existing.id}`,
            "amount": amountInKobo,
            "recipient": existing.transfer_recipient,
            "reference": `payout_order_${existing.id}_${Date.now()}` // Ensure unique identifier string
        }

        const secretKey = process.env.PAYSTACK_SECRET_KEY;
        
        // 4. Fire the transfer initiation
        const transferRes = await transfer(secretKey, transferParams)

        if (!transferRes.status) {
            return res.status(400).json({ 
                message: "Paystack rejected transfer initiation", 
                error: transferRes.message 
            })
        }

        // 💡 SCENARIO A: Your automated system has Paystack Transfer OTPs turned off (RECOMMENDED)
        if (transferRes.data.status !== 'otp') {
            const updatedOrder = await order.updateStatus(existing.id, { 
                status: 'completed' 
            });

            // FIXED: Combined response data into a single object
            return res.status(200).json({
                message: "Escrow OTP verified and payout successfully completed!",
                order: updatedOrder,
                paystack: transferRes.data
            });
        }

      
        const finalizeParams = {
            transfer_code: transferRes.data.transfer_code,
            
        }

        const finalizedRes = await finalizeTransfer(secretKey, finalizeParams)
        
        if (finalizedRes.status) {
            await order.updateStatus(existing.id, { status: 'completed' });
            return res.status(200).json({ message: "Transfer finalized successfully" })
        }

        return res.status(400).json({ message: "Failed to finalize the transfer", error: finalizedRes.message })

    } catch (error) {
        console.error("An error occurred during verification processing:", error)
        return res.status(500).json({ error: "An internal server error occurred" })
    }
}

module.exports = { verifyOtp };