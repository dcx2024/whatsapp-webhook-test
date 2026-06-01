const express=require('express')
const {userHandler}=require('../controllers/userController')
const router=express();

router.post('/register-seller',userHandler)

module.exports=router;