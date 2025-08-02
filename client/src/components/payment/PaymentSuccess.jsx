import { useNavigate, useSearchParams } from "react-router-dom"
import { useEffect } from "react"
import axios from "axios"

const url = 'http://localhost:8000'
const PaymentSuccess = () => {
    axios.defaults.withCredentials = true
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const sessionId = searchParams.get('session_id')

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                if (!sessionId) {
                    navigate('/plans', { replace: true })
                }
                let response = await axios.post(`${url}/payment/verify-session`, { sessionId })
                if (response.status === 200 || response.data.success) {
                    console.log('payment verified')
                }
                else {
                    console.log('payment verification failed')
                    navigate('/plans', { replace: true })
                }
            }
           catch (error) {
              console.log('error while verifying the payment',error)
                }
    }
        verifyPayment()
    },[sessionId,navigate])

    const goHome = () => {

        navigate('/chat')
    }
    return (
        <div className="bg-gray-300 h-screen flex justify-center ">
            <div className="flex flex-col items-center justify-center space-y-4 ">
                <h1 className="text-xl font-bold "> Payment Successful ✅</h1>
                <button onClick={goHome}
                    className="font-semibold bg-slate-400 p-2 rounded-lg w-full "> Go Home</button>
            </div>
        </div>
    )
}

export default PaymentSuccess