require('dotenv').config;
const jwt=require('jsonwebtoken')
const crypto=require('node:crypto')
const JWT_SECRET=process.env.JWT_SECRET;
const { initializeTransaction } = require('../payment')


function generateOTP(){
    return crypto.randomInt(100000,999999).toString();
}

const initialisePayment=async(req,res)=>{
    const {email,phoneNumber,token}=req.body
//use paystack refernece store it in a pending orders table as well as delovery status,amount,expires at,opt_hash,order_id,transfer_recipient(gotten using the seller phone no)
//save in the 
    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        const otp=generateOTP();
        console.log('Transaction Processing has Started...')
        console.log('Decoded whatsapp number', decoded.whatsapp_number)
        const param={
            email:email,
            amount: parseFloat(decoded.amount)*100,
            //callback_url:`${process.env.FRONTEND_URL}/verify`,
            metadata:{
                item_name: decoded.item,
                whatsapp_number: decoded.whatsapp_number,
                customer_phone: phoneNumber,
                otp_code: otp
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
