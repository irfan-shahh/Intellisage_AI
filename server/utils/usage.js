const VerifySubscriptionId=require('./VerifySubscriptionId')
const resetUsageIfNewMonth=(user)=>{
    const now=new Date()
    const last=user.monthlyUsage.lastReset
    const difference=Math.floor((now-last)/(24*60*60*1000))
    if(difference >30){
      if(user.plan==='pro'|| user.plan==='premium'){
          isValid=VerifySubscriptionId(user)
          if(!isValid){
            user.plan='free'
            user.SubscriptionId=undefined
          }
      }
      user.monthlyUsage.chatsUsed=0
      user.monthlyUsage.summariesUsed=0
      user.monthlyUsage.lastReset=now
      
    }

}

const LIMITS = {
  free: { summaries: 5, chats: 10 },
  pro: { summaries: 100, chats: 200 },
  premium: { summaries:Infinity, chats: Infinity },
};
module.exports={ resetUsageIfNewMonth, LIMITS };