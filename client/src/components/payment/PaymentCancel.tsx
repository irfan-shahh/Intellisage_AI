import { useEffect } from "react"
import { useNavigate,useSearchParams } from "react-router-dom"

const PaymentCancel = () => {
    const navigate=useNavigate()
    const [searchParams]=useSearchParams() 
    const sessionId=searchParams.get('session_id')
    useEffect(()=>{
        if(!sessionId){
            navigate('/plans',{replace:true})
        }

    },[sessionId,navigate])
    const goBack=():void=>{
        navigate('/plans')
    }
  return (
      <div className="bg-gray-300 h-screen flex justify-center ">
        <div className="flex flex-col items-center justify-center space-y-4 ">
        <h1 className="text-xl font-bold "> Payment Failed ❌</h1>
        <button onClick={goBack} 
        className="font-semibold bg-slate-400 p-2 rounded-lg w-full "> Go to plans</button>
        </div>
    </div>
  )
}

export default PaymentCancel