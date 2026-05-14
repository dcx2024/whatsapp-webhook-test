const express=require('express');
const { initialisePayment,getBanks } = require('../controllers/paymentController');
const router=express.Router();


router.post('/initialise',initialisePayment)
router.get('/fetchBanks',getBanks)


module.exports=router;
