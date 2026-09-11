const Dashboard=require('../models/dashboardModel');

const getDashboardTotal=async(req,res)=>{
    try{
        const seller_id=req.user.seller_id;
        const stats=await Dashboard.getTotalAmount(seller_id)
        res.json(stats)
    }catch(error){
        return res.status(500).json({error:"Server Error"})
    }
}


module.exports={getDashboardTotal}