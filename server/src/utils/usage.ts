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

    user.monthlyUsage.chatTokenUsed = 0
    user.monthlyUsage.summaryTokenUsed = 0
    user.monthlyUsage.lastReset = now
  }
}

const LIMITS = {
  free: { chatTokens: 20000, summaryTokens:50000  },
  pro: { chatTokens: 200000,summaryTokens: 500000 },
  premium: { chatTokens: Infinity, summaryTokens: Infinity }
}

export { resetUsageIfNewMonth, LIMITS }

export default resetUsageIfNewMonth
