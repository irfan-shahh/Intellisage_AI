const stripe=require('stripe')(process.env.STRIPE_SECRET_KEY)

const VerifySubscriptionId=async (user)=>{
  try{
    if(!user.SubscriptionId){
      return false
    }

    const subscription=await stripe.subscriptions.retrieve(user.SubscriptionId)
    
    return (
      subscription.status === 'active' ||
      subscription.status === 'trialing'
    );
  }catch(error){
   console.error(' Error verifying subscription for user:', user.email, err.message);
    return false;
  }
}

module.exports=VerifySubscriptionId;