import mongoose, { Schema, Document, Model } from 'mongoose'

export interface MonthlyUsage {
  summaryTokenUsed: number
  chatTokenUsed: number
  lastReset: Date
}

export interface IUser extends Document {
  name: string
  email: string
  password: string
  plan: 'free' | 'pro' | 'premium'
  customerId?: string
  SubscriptionId?: string
  monthlyUsage: MonthlyUsage
  previousUsage: MonthlyUsage
  cancelAtPeriodEnd:boolean
  tokenCount:number
}

const userSchema: Schema<IUser> = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'premium'],
    default: 'free'
  },
  customerId: String,
  SubscriptionId: String,
  monthlyUsage: {
    chatTokenUsed: { type: Number, default: 0 },
    summaryTokenUsed: { type: Number, default: 0 },
    lastReset: { type: Date, default: Date.now }
  },
  previousUsage: {
    chatTokenUsed: { type: Number, default: 0 },
    summaryTokenUsed: { type: Number, default: 0 },
    lastReset: { type: Date, default: Date.now }
  },
  cancelAtPeriodEnd:{
   type:Boolean,
   default:false

  },
  tokenCount:{
    type:Number
  }

})

const User: Model<IUser> =
  mongoose.model<IUser>('User', userSchema)

export default User
