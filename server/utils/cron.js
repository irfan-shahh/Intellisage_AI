const cron=require('node-cron')
const User=require('../models/user_model')
const resetUsageIFNewMonth=require('./usage')
cron.schedule('0 0  * * *',async()=>{
    const users=await User.find({})
    for(let user of users){
        await resetUsageIFNewMonth(user)
        await user.save()
    }
})