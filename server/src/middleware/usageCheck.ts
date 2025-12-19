import { Request, Response, NextFunction } from 'express'
import User from '../models/user_model'
import { resetUsageIfNewMonth, LIMITS } from '../utils/usage'
import type { IUser } from '../models/user_model'

interface UsageRequest extends Request {
  user?: {
    id: string
  }
  usage?: {
    plan: string
    summaryTokenLeft: number
    chatTokenLeft: number
    cancelAtPeriodEnd:boolean
    userDoc: IUser
    
  }
}

const checkAndUpdateUsage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
    const usgreq=req as UsageRequest;
  const userId = usgreq.user?.id
  const user = await User.findById(userId)

  if (!user) {
    return res.status(401).json('no user found')
  }

  resetUsageIfNewMonth(user)
  await user.save()

  const limits = LIMITS[user.plan]

  usgreq.usage = {
    plan: user.plan,
    summaryTokenLeft:
      limits.summaryTokens === Infinity
        ? Infinity
        : limits.summaryTokens - user.monthlyUsage.summaryTokenUsed,
    chatTokenLeft:
      limits.chatTokens === Infinity
        ? Infinity
        : limits.chatTokens - user.monthlyUsage.chatTokenUsed,
        cancelAtPeriodEnd:!!user.cancelAtPeriodEnd,
    userDoc: user
  }

  next()
}

export default checkAndUpdateUsage
