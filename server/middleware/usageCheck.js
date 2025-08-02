const { resetUsageIfNewMonth,LIMITS } =require('../utils/usage')
const User=require( '../models/user_model')

const checkAndUpdateUsage= async (req,res,next)=>{
    const userId=req.user.id
    const user=await User.findById(userId)
    if(!user){
        return res.status(401).json('no user found')
    }

    resetUsageIfNewMonth(user)
    await user.save()
    const limits=LIMITS[user.plan]
    req.usage={
        plan:user.plan,
        summariesLeft: limits.summaries===Infinity ? Infinity:limits.summaries-user.monthlyUsage.summariesUsed,
        chatsLeft:limits.chats=== Infinity? Infinity:limits.chats-user.monthlyUsage.chatsUsed,
        userDoc:user,
    }
    next()

}

module.exports=checkAndUpdateUsage