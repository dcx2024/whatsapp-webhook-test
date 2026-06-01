const express=require('express');
const {verifyOtp}=require('../controllers/otpController')
const router=express.Router();


router.post('/verifyOTP',verifyOtp)


module.exports=router;
