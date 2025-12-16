
require('dotenv').config()
const User = require('../models/user_model')
const resetUsageIfNewMonth = require('../utils/usage')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const createCheckOutSession = async (req, res) => {
  const plan = req.query.plan
  if (!plan) {
    return res.send('Subscription plan not found')
  }
  let priceId;
  let planType;

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
    line_items: [
      {
        price: priceId,
        quantity: 1
      }

    ],
    customer_email: req.user.email,
    metadata: {
      plan: planType
    },
    success_url: 'http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'http://localhost:3000/payment/cancel?session_id={CHECKOUT_SESSION_ID}'

  })
  return res.status(200).json({ sessionId: session.id ,url:session.url})
}


const verifySession = async (req, res) => {
  const { sessionId } = req.body
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.payment_status === 'paid') {
      const customerEmail = session.customer_email
      const selectedPlan = session.metadata.plan
      if (!customerEmail || !selectedPlan) {
        return res.status(400).json({ success: false, msg: 'Missing email or plan' });
      }
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      if (subscription.status !== 'active') {
        return res.status(400).json({ success: false, msg: 'Subscription is not active' });
      }
      const updatedUser = await User.findOneAndUpdate({ email: customerEmail }, { plan: selectedPlan, SubscriptionId: subscription.id, customerId: session.customer }, { new: true })
      await resetUsageIfNewMonth(updatedUser);
      await updatedUser.save();
      if (!updatedUser) {
        console.log('updatedUSER not found')
      }
      return res.status(200).json({ success: true, msg: 'Payment verified', email: customerEmail, plan: selectedPlan });


    } else {
      return res.status(400).json({ success: false, msg: 'Payment not completed' });
    }
  } catch (error) {
    console.log('error while verifying the session', error)
  }

}


const activateFreePlan = async (req, res) => {
  try {
    const userId = req.user.id
    const user = await User.findById(userId)

    if (user.plan === 'pro' || user.plan === 'premium') {
      return res.status(400).json({ error: 'You already have a paid plan' });
    }
    await User.findByIdAndUpdate(userId, { plan: 'free' }, { new: true })
    res.status(200).json({ success: true, msg: 'Free plan activated' });

  } catch (error) {
    res.status(500).json({ success: false, msg: 'Failed to activate free plan' });

  }
}

const cancelSubscription = async (req, res) => {
  try {

    const user = await User.findById(req.user.id)
    if (!user || !user.customerId) {
      return res.status(400).json({ msg: 'stripe customer id not found' })
    }
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.customerId
    })
    return res.status(200).json({ url: portalSession.url })


  } catch (error) {
    res.status(500).json({ msg: 'Failed to create billing portal session' });
  }

}

module.exports = { createCheckOutSession, verifySession, activateFreePlan, cancelSubscription }