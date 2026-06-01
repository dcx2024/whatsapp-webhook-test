require('dotenv').config();
const jwt = require('jsonwebtoken')
const crypto = require('node:crypto')
const bcrypt = require('bcrypt')
const JWT_SECRET = process.env.JWT_SECRET;
const { initializeTransaction,fetchBanks } = require('../payment')
const order = require('../models/orderModel')
const user = require('../models/userModel')

function generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
}

const secretKey=process.env.PAYSTACK_SECRET_KEY

const initialisePayment = async (req, res) => {
    const { email, phoneNumber, token } = req.body
    //use paystack reference store it in a pending orders table as well as delivery status,amount,expires at,opt_hash,order_id,transfer_recipient(gotten using the seller phone no from the seller table)
    //save in the 

    console.log("--- New Transaction Attempt ---");
    console.log("Payload:", { email, phoneNumber, tokenReceived: !!token });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        console.log("✅ Token Verified for:", decoded.whatsapp_number);
        const existing = await order.findByCustomerPhone(phoneNumber)
        if (existing) {
            return res.status(401).json({ message: 'This order already exists' })
        }
        const otp = generateOTP();
        const otp_hash = await bcrypt.hash(otp, 10);
        const seller_phone=decoded.whatsapp_number
        console.log('Transaction Processing has Started...')
        console.log('Decoded whatsapp number', decoded.whatsapp_number)
        //fetch the transfer_recipient code from the database using the seller phone no
        const recipientcode = await user.getTransferRecipientCode(seller_phone)
        //store it in the orders database
        const param = {
            email: email,
            amount: parseFloat(decoded.amount) * 100,
            //callback_url:`${process.env.FRONTEND_URL}/verify`,
            metadata: {
                item_name: decoded.item,
                whatsapp_number: decoded.whatsapp_number,
                customer_phone: phoneNumber,
                otp_code: otp
            }
        }

        const secretKey = process.env.PAYSTACK_SECRET_KEY;
        const paystackres = await initializeTransaction(secretKey, param)

        if (paystackres.status) {
            const newOrder =await order.create({
                payment_ref: paystackres.data.reference,
                amount: parseFloat(decoded.amount),
                customer_phone_no: phoneNumber,
                otp_hash: otp_hash,
                transfer_recipient: recipientcode,
                status: 'pending'
            })

            return res.status(200).json(paystackres.data)
        }


        res.status(400).json({ message: "Payment failed to intiialize" })
    } catch (error) {
        console.error('Transaction error:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid or Expired Session" });
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
}


const sellerPayments=async(req,res)=>{
    try{
        console.log("--New payout initiated")
        //logging how the order sttausses change
    }catch{

    }
}

const getBanks = async (req, res) => {
  try {
    const getBanksResponse = await fetchBanks(secretKey)

    const Banks = getBanksResponse.data.map(bank => ({
      name: bank.name,
      code: bank.code
    }));

    return res.status(200).json({ message: 'Banks fetched successfully', banks: Banks })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "An error occurred while fetching banks" })
  }
}


module.exports = { initialisePayment,getBanks }
