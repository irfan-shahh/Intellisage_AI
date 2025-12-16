import mongoose,{Schema,Document,Model} from 'mongoose'

interface IStripeEvent extends Document{
  eventId:string,
  createdAt:Date
}


const stripEventSchema:Schema<IStripeEvent>=new mongoose.Schema({
   eventId:{
    type:String,
    required:true,
    unique:true
   },
   createdAt:{
    type:Date,
    default:Date.now()
   }
})

 const StripeEvent:Model<IStripeEvent>= mongoose.model<IStripeEvent>('StripeEvent',stripEventSchema)
 export default StripeEvent