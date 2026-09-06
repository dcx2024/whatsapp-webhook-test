const express=require('express');
const { initialisePayment,getBanks,verifyAccount } = require('../controllers/paymentController');
const router=express.Router();


router.post('/initialise',initialisePayment)
router.get('/fetchBanks',getBanks)
router.post('/verifyAccount',verifyAccount)


module.exports=router;
