import express, { Request, Response } from 'express'
import stripeLib, { Stripe } from 'stripe'
import User from '../models/user_model'
import StripeEvent from '../models/event_model'

import 'dotenv/config'

const router = express.Router()
const stripe = new stripeLib(process.env.STRIPE_SECRET_KEY as string)

router.post('/', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string
  let event: stripeLib.Event

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET_KEY as string
    )
  } catch (error) {
    return res.status(400).send('Webhook Error')
  }

  const alreadyHandled = await StripeEvent.findOne({ eventId: event.id })
  if (alreadyHandled) {
    return res.status(200).send('Already processed')
  }

  const data: any = event.data.object
  //invoice===data

  switch (event.type) {
    case 'customer.subscription.deleted': {
      const customerId = data.customer
      await User.findOneAndUpdate(
        { customerId },
        {
          plan: 'free',
          SubscriptionId: null,
          cancelAtPeriodEnd:false,
          monthlyUsage: {
            chatsUsed: 0,
            summariesUsed: 0,
            lastReset: new Date()
          }
        },
        { new: true }
      )
      break
    }

    case 'customer.subscription.updated': {
      const customerId = data.customer
      const planId = data.items.data[0].price.id
      const cancelAtPeriodEnd = data.cancel_at_period_end

      let plan = 'free'
      if (planId === process.env.STRIPE_PRICE_ID_PRO) plan = 'pro'
      if (planId === process.env.STRIPE_PRICE_ID_PREMIUM) plan = 'premium'

      const update: any = {
        cancelAtPeriodEnd,
        SubscriptionId: data.id
      }

      const user = await User.findOne({ customerId })

      if (cancelAtPeriodEnd) {
        update.cancelAtPeriodEnd = true
        update.previousUsage = { ...user?.monthlyUsage }
      } else {
        update.plan = plan
        if (user?.previousUsage && user.previousUsage.chatsUsed != null) {
          update.monthlyUsage = { ...user.previousUsage }
          update.previousUsage = {}
        }
      }

      await User.findOneAndUpdate({ customerId }, update, { new: true })
      break
    }

    case 'checkout.session.completed': {
      const session = event.data.object as any
      if (session.mode !== 'subscription') break

      const subscription = await stripe.subscriptions.retrieve(
        session.subscription
      )

      const priceId = subscription.items.data[0]?.price.id
      let plan = 'free'
      if (priceId === process.env.STRIPE_PRICE_ID_PRO) plan = 'pro'
      if (priceId === process.env.STRIPE_PRICE_ID_PREMIUM) plan = 'premium'

      const user = await User.findOneAndUpdate(
        { email: session.customer_email },
        {
          plan,
          customerId: session.customer,
          SubscriptionId: session.subscription,
          cancelAtPeriodEnd: false
        },
        { new: true }
      )
      break
    }

    case 'invoice.payment_succeeded': {
       const invoice =data

  
  if (invoice.billing_reason !== 'subscription_cycle') break

  const customerId = invoice.customer

  const user = await User.findOne({ customerId })
  if (!user) break

  user.monthlyUsage = {
    chatsUsed: 0,
    summariesUsed: 0,
    lastReset: new Date(invoice.lines.data[0].period.start * 1000)
  }

  user.cancelAtPeriodEnd = false

  await user.save()

  console.log(`Usage reset for new billing cycle: ${user.email}`)
      break
    }

    case 'invoice.payment_failed':
      console.log('Payment failed')
      break
  }

  await StripeEvent.create({ eventId: event.id })
  res.status(200).send('Processed')
})

export default router
