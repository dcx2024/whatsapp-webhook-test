const express=require('express');
const router=express.Router();
const {whatsappChallenge,messageListener}=require('../controllers/whatsappController')
router.get('/',whatsappChallenge)
router.post('/', messageListener)

module.exports=router;
