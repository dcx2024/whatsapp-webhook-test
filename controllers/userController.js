const {confirmAccount,
    createTransferRecipient} =require('../payment')

const userHandler = async (req, res) => {
    try {
        const { sellername, account_no, bank_code } = req.body;
        
        // 1. Always verify before proceeding
        const confirmed = await confirmAccount(process.env.PAYSTACK_SECRET_KEY, account_no, bank_code);
        if (!confirmed.status) {
            return res.status(400).json({ message: "Account verification failed" });
        }

        // 2. Only proceed if verified
        const params = { type: "nuban", name: sellername, account_number: account_no, bank_code, currency: "NGN" };
        const transferRecipient = await createTransferRecipient(process.env.PAYSTACK_SECRET_KEY, params);
        
        if (transferRecipient.status) {
            // SAVE TO DB HERE (e.g., await db.sellers.update(...))
            return res.status(200).json(transferRecipient.data);
        }
        
        throw new Error("Recipient creation failed");
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};