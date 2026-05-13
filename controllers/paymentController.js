require('dotenv').config;
const jwt=require('jsonwebtoken')
const crypto=require('node:crypto')
const bcrypt=require('bcrypt')
const JWT_SECRET=process.env.JWT_SECRET;
const { initializeTransaction } = require('../payment')
const order=require('../models/orderModel')
const user=require('../models/userModel')

function generateOTP(){
    return crypto.randomInt(100000,999999).toString();
}

const initialisePayment=async(req,res)=>{
    const {email,phoneNumber,token}=req.body
//use paystack reference store it in a pending orders table as well as delivery status,amount,expires at,opt_hash,order_id,transfer_recipient(gotten using the seller phone no from the seller table)
//save in the 
    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        const existing=await order.findByCustomerPhone(phoneNumber)
        if(existing){
        return res.status(401).json({message:'This order already exists'})
        }
        const otp=generateOTP();
        const otp_hash=bcrypt.hash(otp,10)
        console.log('Transaction Processing has Started...')
        console.log('Decoded whatsapp number', decoded.whatsapp_number)
        //fetch the transfer_recipient code from the database using the seller phone no
        const recipientcode=await user.getTransferRecipientCode(phoneNumber)
        //store it in the orders database
        const param={
            email:email,
            amount: parseFloat(decoded.amount)*100,
            //callback_url:`${process.env.FRONTEND_URL}/verify`,
            metadata:{
                item_name: decoded.item,
                whatsapp_number: decoded.whatsapp_number,
                customer_phone: phoneNumber,
                otp_code:otp
            }
        }

        const secretKey=process.env.PAYSTACK_SECRET_KEY;
        const paystackres=await initializeTransaction(secretKey,param)

        if(paystackres.status){
            return res.status(200).json(paystackres.data)
        }

        const newOrder=order.create({
            payment_ref: paystackres.data.reference,
            amount: parseFloat(decoded.amount),
             customer_phone: phoneNumber,
                otp_hash: otp_hash,
                transfer_recipient: recipientcode,
                status:'pending'
        })

        res.status(400).json({message: "Payment failed to intiialize"})
    }catch(error){
        console.error('Transaction error', error);
        res.status(500).json({ message: "Server Error" });
    }
}


module.exports={initialisePayment}
