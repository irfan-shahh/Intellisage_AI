import jwt from 'jsonwebtoken'
import User from '../models/user_model'
import { Request, Response, NextFunction } from 'express'
import 'dotenv/config'
import type { IUser } from '../models/user_model'

interface JwtPayload {
  userId: string
  email: string
}

interface AuthenticateRequest extends Request {
  user?: IUser
}

const authenticate = async (
  req: AuthenticateRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const token = req.cookies.token
    if (!token) {
      return res
        .status(401)
        .json({ msg: 'Access denied. No token provided.' })
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY as string
    ) as JwtPayload

    const userData = await User.findById(decoded.userId)
    if (!userData) {
      return res
        .status(401)
        .json({ msg: 'Invalid token. User not found.' })
    }

    req.user = userData

    next()
  } catch (error) {
    return res.status(401).json({ msg: 'Invalid token.' })
  }
}

export default authenticate
