const {confirmAccount,
    createTransferRecipient} =require('../payment')
    const seller=require("../models/userModel")

const userHandler = async (req, res) => {
    try {
        const { full_name,business_name,account_no,email,phone_no,bank_code } = req.body;
        
        // 1. Always verify before proceeding
       /* const confirmed = await confirmAccount(process.env.PAYSTACK_SECRET_KEY, account_no, bank_code);
        if (!confirmed.status) {
            return res.status(400).json({ message: "Account verification failed" });
        }
*/
        // 2. Only proceed if verified
        const params = { type: "nuban", name: full_name, account_number: account_no, bank_code, currency: "NGN" };
        const transferRecipient = await createTransferRecipient(process.env.PAYSTACK_SECRET_KEY, params);
        
        if (transferRecipient.status=true) {
            // SAVE TO DB HERE (e.g., await db.sellers.update(...))
            const newSeller=await seller.create({
                full_name:transferRecipient.data.name,
                seller_name:business_name,
                transfer_recipient: transferRecipient.data.recipient_code,
                email:email,
                phone_no:phone_no
            })
            return res.status(200).json(transferRecipient.data);
        }
        
        throw new Error("Recipient creation failed");
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports={userHandler}