import stripeLib from 'stripe'
import 'dotenv/config'

const stripe = new stripeLib(process.env.STRIPE_SECRET_KEY as string)

const VerifySubscriptionId = async (user: any): Promise<boolean> => {
  try {
    if (!user.SubscriptionId) {
      return false
    }

    const subscription = await stripe.subscriptions.retrieve(
      user.SubscriptionId
    )

    return (
      subscription.status === 'active' ||
      subscription.status === 'trialing'
    )
  } catch (error: any) {
    console.error(
      ' Error verifying subscription for user:',
      user.email,
      error.message
    )
    return false
  }
}

export default VerifySubscriptionId
