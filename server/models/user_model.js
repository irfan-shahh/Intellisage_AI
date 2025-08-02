const mongoose=require('mongoose')

const userSchema=new mongoose.Schema({
     name:{
        type:String,
        required:true
     },
     email:{
        type:String,
        required:true
     },
     password:{
        type:String,
        required:true
     },
     plan:{
      type:String,
      enum:['free','pro','premium'],
      default:'free'
     },
     customerId:String,
     SubscriptionId:String,
     monthlyUsage:{
       chatsUsed:{type:Number,default:0},
       summariesUsed:{type:Number,default:0},
       lastReset:{type:Date,default:Date.now()},
     },

previousUsage: {
  chatsUsed: { type: Number, default: 0 },
  summariesUsed: { type: Number, default: 0 },
  lastReset: { type: Date, default: Date.now }
}
})
module.exports=mongoose.model('User',userSchema)