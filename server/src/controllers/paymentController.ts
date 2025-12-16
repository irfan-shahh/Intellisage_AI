import 'dotenv/config'
import { Request, Response } from 'express'
import stripeLib from 'stripe'
import User from '../models/user_model'


const stripe = new stripeLib(process.env.STRIPE_SECRET_KEY as string)

interface AuthRequest extends Request {
  user: {
    id: string
    email: string
  }
}

export const createCheckOutSession = async (req: Request, res: Response) => {
  const authreq=req as AuthRequest
  const plan = authreq.query.plan as string
  if (!plan) {
    return res.send('Subscription plan not found')
  }

  let priceId: string | undefined
  let planType: string

  switch (plan.toLowerCase()) {
    case 'pro':
      priceId = process.env.STRIPE_PRICE_ID_PRO
      planType = 'pro'
      break
    case 'premium':
      priceId = process.env.STRIPE_PRICE_ID_PREMIUM
      planType = 'premium'
      break
    default:
      return res.send('Subscription plan not found')
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId!, quantity: 1 }],
    customer_email: authreq.user.email,
    success_url:
      'http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url:
      'http://localhost:3000/payment/cancel?session_id={CHECKOUT_SESSION_ID}'
  })

  return res.status(200).json({ sessionId: session.id, url: session.url })
}

export const verifySession = async (req: Request, res: Response) => {
  const { sessionId } = req.body as { sessionId: string }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    return res.json({
      paid: session.payment_status === 'paid',
      status: session.status,
      customerEmail: session.customer_email
    })
  } catch (error) {
    console.log('error while verifying the session', error)
  }
}

export const activateFreePlan = async (req: Request, res: Response) => {
  try {
    const authreq=req as AuthRequest
    const userId = authreq.user.id
    const user = await User.findById(userId)

    if (user?.plan === 'pro' || user?.plan === 'premium') {
      return res.status(400).json({ error: 'You already have a paid plan' })
    }

    await User.findByIdAndUpdate(userId, { plan: 'free' }, { new: true })
    res.status(200).json({ success: true, msg: 'Free plan activated' })
  } catch (error) {
    res.status(500).json({ success: false, msg: 'Failed to activate free plan' })
  }
}

export const cancelSubscription = async (req: Request, res: Response) => {
  try {
    const authreq=req as AuthRequest
    const user = await User.findById(authreq.user.id)
    if (!user || !user.customerId) {
      return res.status(400).json({ msg: 'stripe customer id not found' })
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.customerId
    })

    return res.status(200).json({ url: portalSession.url })
  } catch (error) {
    res.status(500).json({ msg: 'Failed to create billing portal session' })
  }
}
