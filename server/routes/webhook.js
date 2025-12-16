const express = require('express')
const router = express.Router()
require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const User = require('../models/user_model')

router.post('/', async (req, res) => {
  const sig = req.headers['stripe-signature']
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET_KEY)

  } catch (error) {
    return res.status(400).send('Webhook Error:', error)
  }
  const data = event.data.object
  switch (event.type) {
    case 'customer.subscription.deleted': {
      const customerId = data.customer
      await User.findOneAndUpdate({ customerId }, {
        plan: 'free',
        SubscriptionId: null,
        monthlyUsage: { chatsUsed: 0, summariesUsed: 0, lastReset: new Date() }
      }, { new: true })
      console.log('Subscription cancelled. Downgraded to free.')
      break
    }
    case 'customer.subscription.updated': {
      const customerId = data.customer;
      const planId = data.items.data[0].price.id;
      const cancelAtPeriodEnd = data.cancel_at_period_end;


      let plan = 'free';
      if (planId === process.env.STRIPE_PRICE_ID_PRO) {
        plan = 'pro';
      } else if (planId === process.env.STRIPE_PRICE_ID_PREMIUM) {
        plan = 'premium';
      }

      const update = {
        cancelAtPeriodEnd,
        SubscriptionId: data.id
      }

      const user = await User.findOne({ customerId })

      if (cancelAtPeriodEnd) {
        update.plan = 'free';
        update.SubscriptionId = null;
         update.previousUsage = { ...user.monthlyUsage };
        update.monthlyUsage = {
          chatsUsed: 0,
          summariesUsed: 0,
          lastReset: new Date()
        }
        console.log(`🕓 User ${user.email} requested cancellation. Plan remains ${user.plan} until end of billing cycle.`);
      } else {


        let newPlan = 'free';
        if (planId === process.env.STRIPE_PRICE_ID_PRO) newPlan = 'pro';
        if (planId === process.env.STRIPE_PRICE_ID_PREMIUM) newPlan = 'premium';
        update.plan=newPlan

        if (user.previousUsage && user.previousUsage.chatsUsed != null) {
          update.monthlyUsage = { ...user.previousUsage };
          update.previousUsage = {}; // Clear backup
          console.log(`🔁 User ${user.email} resumed. Plan set to ${newPlan}. Restored usage.`);
        } else {
          console.log(`🔁 User ${user.email} resumed. Plan set to ${newPlan}. No usage to restore.`);
        }

      }
      await User.findOneAndUpdate({ customerId }, update, { new: true });
      break;
    }


     case 'customer.subscription.deleted': {
      const customerId = data.customer;
      const user = await User.findOne({ customerId });

      if (!user) {
        console.log(` No user found for customerId: ${customerId}`);
        break;
      }

      if (user.plan === 'free') {
        console.log(`Subscription already cancelled for ${user.email}. Skipping.`);
        break;
      }

      await User.findOneAndUpdate(
        { customerId },
        {
          plan: 'free',
          SubscriptionId: null,
          cancelAtPeriodEnd: false,
          monthlyUsage: {
            chatsUsed: 0,
            summariesUsed: 0,
            lastReset: new Date()
          },
          previousUsage: {} // Clean up backup if still exists
        },
        { new: true }
      );

      console.log(` Final deletion: ${user.email} downgraded to FREE.`);
      break;
    }
    case 'invoice.payment_succeeded':
      console.log('Payment succeeded')
      break

    case 'invoice.payment_failed':
      console.log('Payment failed')
      break



    default:
      console.log(`Unhandled event type ${event.type}`)
  }
  res.status(200).send('Recieved')
})
module.exports = router