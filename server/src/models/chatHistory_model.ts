import mongoose,{Schema,Document, Types, Model} from "mongoose";
import User from "./user_model";

interface chatSchema extends Document {
 user:Types.ObjectId
 prompt:string
 response:string
 createdAt:Date,
 
}

const chatHistorySchema:Schema<chatSchema>=new mongoose.Schema({
    user:{
        ref:User,
        type:Schema.Types.ObjectId,
        required:true
    },
      prompt:{
        type:String,
        required:true
      },
      response:{
        type:String,
        required:true   
      }  
},
{timestamps:true}
)
  const ChatHistory:Model<chatSchema>= mongoose.model('ChatHistory',chatHistorySchema)
  export default ChatHistory;