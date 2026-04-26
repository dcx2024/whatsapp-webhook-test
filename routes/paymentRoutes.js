const express=require('express');
const { initialisePayment } = require('../controllers/paymentController');
const router=express.Router();


router.post('/initialise',initialisePayment)


module.exports=router;
