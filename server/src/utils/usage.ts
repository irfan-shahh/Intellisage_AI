import VerifySubscriptionId from "./VerifySubscriptionId"

const resetUsageIfNewMonth = (user: any) => {
  const now = new Date()
  const last = user.monthlyUsage.lastReset
  const difference = Math.floor(
    (now.getTime() - last.getTime()) / (24 * 60 * 60 * 1000)
  )

  if (difference > 30) {
    if (user.plan === 'pro' || user.plan === 'premium') {
      const isValid = VerifySubscriptionId(user)
      if (!isValid) {
        user.plan = 'free'
        user.SubscriptionId = undefined
      }
    }

    user.monthlyUsage.chatsUsed = 0
    user.monthlyUsage.summariesUsed = 0
    user.monthlyUsage.lastReset = now
  }
}

const LIMITS = {
  free: { summaries: 5, chats: 10 },
  pro: { summaries: 100, chats: 200 },
  premium: { summaries: Infinity, chats: Infinity }
}

export { resetUsageIfNewMonth, LIMITS }

export default resetUsageIfNewMonth
