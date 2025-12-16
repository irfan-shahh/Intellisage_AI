import mongoose, { Schema, Document, Model } from 'mongoose'

export interface MonthlyUsage {
  chatsUsed: number
  summariesUsed: number
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
    chatsUsed: { type: Number, default: 0 },
    summariesUsed: { type: Number, default: 0 },
    lastReset: { type: Date, default: Date.now }
  },
  previousUsage: {
    chatsUsed: { type: Number, default: 0 },
    summariesUsed: { type: Number, default: 0 },
    lastReset: { type: Date, default: Date.now }
  },
  cancelAtPeriodEnd:{
   type:Boolean,
   default:false

  }
})

const User: Model<IUser> =
  mongoose.model<IUser>('User', userSchema)

export default User
