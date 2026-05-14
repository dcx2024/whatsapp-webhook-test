const bcrypt=require('bcrypt')
const order=require('../models/orderModel')
const verifyOtp=async(req,res)=>{
    try{
    const {otp,customerPhone}=req.body;
    const existing=await order.findByCustomerPhone(customerPhone)

    if(!existing) return ({message: "order not found"})

        const match=bcrypt.compare(otp,existing.otp_hash)
        if(!match) return ({message:"Invalid or expired otp entered"})

        return res.status(200).json({message:"Otp verified successfully"})
    } catch(error){
        console.error("an error occurred",error)
        res.status(500).json({error:"An error occurred"})
    }
}