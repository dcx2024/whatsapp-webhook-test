const jwt=require('jsonwebtoken')

const authenticatedUser=(req,res,next)=>{
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({message:"Access denied,No token provided in cookies"})
    }

    try{
        const decodedPayload=jwt.verify(token,process.env.JWT_SECRET);
        req.user=decodedPayload
        next()
    }catch(error){
        console.log(error)
        return res.status(400).json({error:'Invalid Token'})
    }
}

module.exports=authenticatedUser