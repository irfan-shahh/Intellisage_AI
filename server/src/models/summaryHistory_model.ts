import mongoose,{Schema,Document, Types, Model} from "mongoose";
import User from "./user_model";


interface summarySchema extends Document {
 user:Types.ObjectId
 prompt:string
 summary:string
 fileName?:string
 fileSize?:Number
 mimeType?:string
 createdAt:Date
}

const summaryHistorySchema:Schema<summarySchema>=new mongoose.Schema({
    user:{
        ref:User,
        type:Schema.Types.ObjectId,
        required:true
    },
      prompt:{
        type:String,
        required:false
      },
      summary:{
        type:String,
        required:true
      },
      fileName:{
        type:String
      },
      fileSize:{
        type:Number
      },
      mimeType:{
        type:String
      }
},
{timestamps:true}
)
  const summaryHistory:Model<summarySchema>= mongoose.model('summaryHistory',summaryHistorySchema)
  export default summaryHistory;