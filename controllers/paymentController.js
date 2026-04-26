require('dotenv').config;
const jwt=require('jsonwebtoken')
const JWT_SECRET=process.env.JWT_SECRET;
const { initializeTransaction } = require('../payment')

const initialisePayment=async(req,res)=>{
    const {email,phoneNumber,token}=req.body

    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        console.log('Transaction Processing has Started...')
        const param={
            email:email,
            amount: parseFloat(decoded.amount)*100,
            //callback_url:`${process.env.FRONTEND_URL}/verify`,
            metadata:{
                item_name: decoded.item,
                whatsapp_number: decoded.whatsapp_number
            }
        }

        const secretKey=process.env.PAYSTACK_SECRET_KEY;
        const paystackres=await initializeTransaction(secretKey,param)

        if(paystackres.status){
            return res.status(200).json(paystackres.data)
        }

        res.status(400).json({message: "Payment failed to intiialize"})
    }catch(error){
        console.error('Transaction error', error);
        res.status(500).json({ message: "Server Error" });
    }
}


module.exports={initialisePayment}
