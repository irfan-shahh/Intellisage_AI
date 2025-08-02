const jwt=require('jsonwebtoken')
const User=require('../models/user_model')
require('dotenv').config()

 const authenticate=async (req,res,next)=>{
    try{

    
    const token=req.cookies.token;
    if(!token){
      return  res.status(401).json({msg:'no token provided'})
    }
  const decoded=jwt.verify(token,process.env.JWT_SECRET_KEY)
   const userData= await User.findById(decoded.userId)
   if(!userData){
    return res.status(200).json({msg:'user not found'})
   }
  req.user={
    name:userData.name,
    email:userData.email,
    id:userData._id,
  }
  next()
}catch(error){
    console.log('error while authenticating user',error)
}
}
module.exports=authenticate;