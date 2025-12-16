const User=require('../models/user_model')
const bcrypt=require('bcrypt')
const jwt =require('jsonwebtoken')



const registerUser=async (req,res)=>{
    try{
    const exist=await User.findOne({email:req.body.email})
    if(exist){
        return res.status(401).json({msg:'user already exist'})
    }
    const hashedPassword=await bcrypt.hash(req.body.password,10)
    const newData={...req.body,password:hashedPassword}
    const newUser=await User.create(newData)
    return res.status(200).json({msg:'new user created',newUser})
}catch(error){
    console.log('error while creating a new user',error)
}
}
const loginUser=async (req,res)=>{
    try{
      const exist=await User.findOne({email:req.body.email})
      if(!exist){
       return  res.status(500).json({msg:'user does not exist'})
      }
      const isPasswordValid=await bcrypt.compare(req.body.password,exist.password)
      if(!isPasswordValid){
        return res.status(401).json({msg:'invalid login'})
      }
      const token=  jwt.sign({userId:exist._id,email:exist.email},process.env.JWT_SECRET_KEY,{expiresIn:'30d'})
      res.cookie('token',token,{
         httpOnly:true,
         maxAge:7*24*60*60*1000
      })
      return res.status(200).json({msg:'Login successful',user:{
        name:exist.name,
        email:exist.email,
        plan:exist.plan
      }})

    }catch(error){
        console.log('error while logging in',error)
    }
}
 
const logoutUser=(req,res)=>{
     res.clearCookie('token',{
        httpOnly:true
     })
     return res.status(200).json({msg:'logout successfully'})
}

const verifyUser=async (req,res)=>{
    const token=req.cookies.token
    if(!token){
        return res.status(401).json({msg:'no token provided'})
    }
      const decoded=  jwt.verify(token,process.env.JWT_SECRET_KEY)

      const userData=await User.findById(decoded.userId)
      if(!userData){
                return res.status(401).json({msg:'no data found'})
      }
     return res.status(200).json({user:{
        name:userData.name,
        emaik:userData.email,
        id:userData._id,
        plan:userData.plan,
        customerId:userData.customerId,
        SubscriptionId:userData.SubscriptionId

     }})

}

const getUsage= async (req,res)=>{
  try {
    const { plan, summariesLeft, chatsLeft } = req.usage;

    return res.status(200).json({
      plan,
      summariesLeft,
      chatsLeft,
    });

  } catch (error) {
    console.error('Error in getUsageInfo:', error);
    return res.status(500).json({ error: 'Failed to get usage info' });
  }
};

module.exports={registerUser,loginUser,logoutUser,verifyUser,getUsage}