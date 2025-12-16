import axios from 'axios'
import {  useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useDataContext } from '../context/useDataContext'

const url = 'http://localhost:8000'
axios.defaults.withCredentials = true

interface Usage {
  plan: string
  chatsLeft: number | string
  summariesLeft: number | string
  cancelAtPeriodEnd:boolean
}

const Account = () => {
  const [usage, setUsage] = useState<Usage | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const navigate = useNavigate()
  const { user } = useDataContext()

  const cancelPlan = async (): Promise<void> => {
    try {
      if (usage?.plan === 'free') {
        navigate('/plans')
      } else {
        const response = await axios.get(`${url}/cancel`)
        window.location.href = response.data.url
      }
    } catch (error) {
      console.log('error while cancelling plan', error)
    }
  }

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${url}/api/ai/usage`)
        setUsage(response.data)
      } catch (error) {
        console.error('Failed to fetch usage:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsage()
  }, [])

  return (
    <div className="min-h-[82.6vh] bg-[#f4f7fb] flex justify-center items-center px-4">
      <div className="w-full max-w-3xl bg-white border rounded-xl shadow-sm p-8">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-8">
          Account Overview
        </h2>

        <div className="flex items-center gap-4 border bg-[#fafcff] rounded-lg p-5 mb-8">
          <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center text-xl font-semibold">
            {user?.name?.charAt(0)}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {user?.name}
            </h3>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-lg border bg-[#eef3ff]">
            <p className="text-gray-600 text-sm">Plan</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {usage?.plan}
            </p>
          </div>

          <div className="p-5 rounded-lg border bg-[#f1f7ff]">
            <p className="text-gray-600 text-sm">Chats Left</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {usage?.chatsLeft || 'Unlimited'}
            </p>
          </div>

          <div className="p-5 rounded-lg border bg-[#f3faff]">
            <p className="text-gray-600 text-sm">Summaries Left</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {usage?.summariesLeft || 'Unlimited'}
            </p>
          </div>
        </div>

        <div className="flex justify-center mt-10">
          <button
  onClick={cancelPlan}
  className="px-6 py-3 rounded-lg text-sm font-semibold border bg-[#e7efff] hover:bg-[#d9e6ff] text-gray-800 transition"
>
  {usage?.plan === 'free'
    ? 'Upgrade Plan'
    : usage?.cancelAtPeriodEnd
      ? 'Resume Subscription'
      : 'Cancel Subscription'}
</button>
        </div>
      </div>
    </div>
  )
}

export default Account
