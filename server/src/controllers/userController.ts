import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/user_model'
import ChatHistory from '../models/chatHistory_model'
import summaryHistory from '../models/summaryHistory_model'

interface JwtPayload {
  userId: string
  email: string
}
interface AuthRequest extends Request{
  user:{
    id:string
    email:string
    plan:string
  }
}

export const registerUser = async (req: Request, res: Response) => {
  try {
    const exist = await User.findOne({ email: req.body.email })
    if (exist) {
      return res.status(401).json({ msg: 'user already exist' })
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const newData = { ...req.body, password: hashedPassword }
    const newUser = await User.create(newData)

    return res.status(200).json({ msg: 'new user created', newUser })
  } catch (error) {
    console.log('error while creating a new user', error)
  }
}

export const loginUser = async (req: Request, res: Response) => {
  try {
    const exist = await User.findOne({ email: req.body.email })
    if (!exist) {
      return res.status(500).json({ msg: 'user does not exist' })
    }

    const isPasswordValid = await bcrypt.compare(
      req.body.password,
      exist.password
    )

    if (!isPasswordValid) {
      return res.status(401).json({ msg: 'invalid login' })
    }

    const token = jwt.sign(
      { userId: exist._id, email: exist.email },
      process.env.JWT_SECRET_KEY as string,
      { expiresIn: '30d' }
    )

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return res.status(200).json({
      msg: 'Login successful',
      user: {
        name: exist.name,
        email: exist.email,
        plan: exist.plan
      }
    })
  } catch (error) {
    console.log('error while logging in', error)
  }
}

export const logoutUser = (req: Request, res: Response) => {
  res.clearCookie('token', { httpOnly: true })
  return res.status(200).json({ msg: 'logout successfully' })
}

export const verifyUser = async (req: Request, res: Response) => {
  const token = req.cookies.token
  if (!token) {
    return res.status(401).json({ msg: 'no token provided' })
  }

  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET_KEY as string
  ) as JwtPayload

  const userData = await User.findById(decoded.userId)
  if (!userData) {
    return res.status(401).json({ msg: 'no data found' })
  }

  return res.status(200).json({
    user: {
      name: userData.name,
      email: userData.email,
      id: userData._id,
      plan: userData.plan,
      customerId: userData.customerId,
      SubscriptionId: userData.SubscriptionId
    }
  })
}

export const getUsage = async (req: any, res: Response) => {
  try {
    const { plan, summaryTokenLeft, chatTokenLeft,cancelAtPeriodEnd } = req.usage

    return res.status(200).json({
      plan,
      summaryTokenLeft,
      chatTokenLeft,
      cancelAtPeriodEnd
    })
  } catch (error) {
    console.error('Error in getUsageInfo:', error)
    return res.status(500).json({ error: 'Failed to get usage info' })
  }
}


export const getHistory=async(req:Request,res:Response):Promise<Response|void>=>{
  const hreq=req as AuthRequest;
  const {type,from,to} =req.query as {type:string,from:string,to:string};
  const userId=hreq.user.id;
  const plan =hreq.user?.plan
  if(plan==='free'){
      return res.status(403).json({
      message: 'Upgrade to view history'
    })
  }
  const dateFilter:any={}
  if(from || to){
    dateFilter.createdAt={}
    if(from){
      dateFilter.createdAt.$gte=new Date(from)
    }
    if(to) {
      
      dateFilter.createdAt.$lte=new Date(to)
    }
  }


   const history = type === 'chat' 
     ? await ChatHistory.find({ user: userId, ...dateFilter }).sort({ createdAt: -1 })
     : await summaryHistory.find({ user: userId, ...dateFilter }).sort({ createdAt: -1 })
   
   return res.json(history)

}


