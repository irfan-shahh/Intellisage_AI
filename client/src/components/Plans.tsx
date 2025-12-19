import axios from 'axios'
import { activateFree, buySubscription } from '../services/api'
import { loadStripe } from '@stripe/stripe-js'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useDataContext } from '../context/useDataContext'

const stripePromise = loadStripe(
  process.env.REACT_APP_STRIPE_PUBLIC_KEY as string
)
axios.defaults.withCredentials = true

const Plans = () => {
  const navigate = useNavigate()
  const { user }: any = useDataContext()
  const [error, setError] = useState<boolean>(false)
  const [planErrorPro, setPlanErrorPro] = useState<string>('')
  const [planErrorPremium, setPlanErrorPremium] = useState<string>('')

  const upgradePlan = async (plan: string): Promise<void> => {
    try {
      if (plan === 'pro') {
        if (user.plan === 'pro') {
          setPlanErrorPro('You already have the pro plan !')
          return
        }
        if (user.plan === 'premium') {
          setPlanErrorPro('You already have a higher plan premium !')
          return
        }
      }

      if (plan === 'premium' && user.plan === 'premium') {
        setPlanErrorPremium('You already have Premium Plan !')
        return
      }

      const response = await buySubscription(plan)
      const stripe = await stripePromise
      await stripe?.redirectToCheckout({
        sessionId: response?.data.sessionId
      })
    } catch (error) {
      console.log('error while getting to the stripe payment', error)
    }
  }

  const activateFreePlan = async (): Promise<void> => {
    const response = await activateFree()
    if (response?.status === 200) navigate('/chat')
    else setError(true)
  }
  
  return (
    <div className="min-h-[82.6vh] bg-gray-100 flex flex-col items-center py-12">

      <h1 className="text-2xl font-semibold mb-10">Choose Your Plan</h1>

      <div className="flex flex-col lg:flex-row gap-8">

    
        <div className="bg-white border rounded-lg shadow-sm w-80 p-6">
          <h2 className="font-semibold mb-2">Free Plan</h2>
          <p className="text-3xl font-bold mb-4">$0</p>

          <ul className="space-y-2 text-sm mb-6 text-gray-700">
            <li>✅ 20k AI Chat Tokens</li>
            <li>✅ 50k AI Summary Tokens</li>
            <li>❌ No Data Persistence</li>
            <li>❌ No OCR Support</li>
          </ul>

          <button
            className="w-full border py-2 rounded-md text-sm hover:bg-gray-50"
            onClick={activateFreePlan}
          >
            Continue Free
          </button>

          {error && (
            <p className="text-red-600 text-sm font-medium mt-2 text-center">
              You already have a plan !
            </p>
          )}
        </div>

   
        <div className="bg-white border rounded-lg shadow-sm w-80 p-6">
          <h2 className="font-semibold mb-2">Pro Plan</h2>
          <p className="text-3xl font-bold mb-4">$20 <span className='text-xl'>/month</span></p>

          <ul className="space-y-2 text-sm mb-6 text-gray-700">
            <li>🔥 200k AI Chat Tokens</li>
            <li>🔥 500k AI Summary Tokens</li>
            <li>🔥 Data Persistence</li>
            <li>🔥 OCR Supported</li>
          </ul>

          <button
            className="w-full bg-black text-white py-2 rounded-md text-sm hover:opacity-90"
            onClick={() => upgradePlan('pro')}
          >
            Upgrade to Pro
          </button>

          {planErrorPro && (
            <p className="text-red-600 text-sm font-medium mt-2 text-center">
              {planErrorPro}
            </p>
          )}
        </div>

      
        <div className="bg-white border rounded-lg shadow-sm w-80 p-6">
          <h2 className="font-semibold mb-2">Premium Plan</h2>
          <p className="text-3xl font-bold mb-4">$70 <span className='text-xl'>/month</span></p>

          <ul className="space-y-2 text-sm mb-6 text-gray-700">
             <li>🚀 Unlimited AI Chat Tokens</li>
            <li>🚀 Unlimited AI Summary Tokens</li>
            <li>🚀 Data Persistance</li>
            <li>🚀 OCR Supported</li>
          </ul>

          <button
            className="w-full bg-black text-white py-2 rounded-md text-sm hover:opacity-90"
            onClick={() => upgradePlan('premium')} 
          >
            Upgrade to Premium
          </button>

          {planErrorPremium && (
            <p className="text-red-600 text-sm font-medium mt-2 text-center">
              {planErrorPremium}
            </p>
          )}
        </div>

      </div>
    </div>
  )
}

export default Plans
