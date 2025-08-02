
import axios from "axios"
import { activateFree, buySubscription } from "../services/api"
import {loadStripe} from '@stripe/stripe-js'
import { useNavigate } from "react-router-dom"
import { useState,useContext } from "react"
import {DataContext} from '../context/DataProvider'


const stripePromise=loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY)
axios.defaults.withCredentials=true

const Plans = () => {
  const navigate=useNavigate()
   const { user } = useContext(DataContext) 
  const[error,setError]=useState(false)
  const[planErrorPro,setPlanErrorPro]=useState('')
  const[planErrorPremium,setPlanErrorPremium]=useState('')
       
  const upgradePlan= async (plan)=>{
   try{
    
    if(plan==='pro'){
      if(user.plan==='pro'){
        setPlanErrorPro('You already have the pro plan !')
        return
      }
      if(user.plan==='premium'){
        setPlanErrorPro('You already have a higher plan premium !')
        return
      }
    }
    if(plan==='premium'){
      if(user.plan==='premium'){
        setPlanErrorPremium('You already have Premium Plan !')
        return
      }
    }
   const response= await buySubscription(plan)
   const stripe=await stripePromise;
    await stripe.redirectToCheckout({
      sessionId:response.data.sessionId
    })
   }
  
   catch(error){    
      console.log('error while getting to the stripe payment',error)
    }
   }   
   

   const activateFreePlan= async ()=>{
           let response= await activateFree()
           if(response && response.status===200){
            console.log(response)
            console.log('free plan activated')
            navigate('/chat')
           }
           else{
            setError(true)
           }
   }
  
  return (
    <div className=" h-[82.6vh] bg-blue-200 justify-center " >
        <h1 className="font-semibold text-center pt-9 text-xl">Choose Your Plan</h1>
        <div className="flex gap-x-10 pt-8 justify-center mb-0  ">

       <div className="h-2/3 bg-blue-100 max-w-2xl rounded-lg w-80 p-8  ">
       <div className="flex items-center">
          <h2 className="font-bold mb-4 w-full">Free Plan</h2>
            <h1 className="font-bold text-5xl mb-4 ml-24">$0</h1>
       </div>
          <ul className="space-y-3">
              <li>✅ 5 PDFs per month</li>
            <li>✅ 20 chat prompts</li>
            <li>✅ Max file size: 2MB</li>
          </ul>
           <button className="w-full mt-4 bg-blue-300 font-bold p-2 rounded-xl"
           onClick={activateFreePlan}>Continue free</button>
           {
            error && <p className="text-red-600 font-semibold text-sm">You already have a plan !</p>
           }
           
         
       </div>
         
       <div className="h-2/3 bg-blue-100 max-w-sm rounded-lg w-80 p-8 ">
            <div className="flex items-center">
          <h2 className="font-bold mb-4 w-full">Pro Plan</h2>
            <h1 className="font-bold text-5xl mb-4 ml-24">$20</h1>
            <span className="font-semibold text-xl ">/month</span>
       </div>
          <ul className="space-y-3">
              <li>🚀 50 PDFs per month</li>
            <li>🚀 200 chat prompts</li>
            <li>🚀 Max file size: 10MB</li>
          </ul>
             <button className="w-full mt-4 bg-blue-300 font-bold p-2 rounded-xl" onClick={()=>upgradePlan('pro')}>Upgrade to Pro</button>
              {planErrorPro && (
            <p className="text-red-600 font-semibold text-sm mt-2">
              {planErrorPro}
            </p>
          )}   
       </div>
       <div className="h-2/3 bg-blue-100 max-w-sm rounded-lg w-80 p-8 ">
            <div className="flex items-center">
          <h2 className="font-bold mb-4 w-full">Premium Plan</h2>
            <h1 className="font-bold text-5xl mb-4 ml-14">$70</h1>
            <span className="font-semibold text-xl ">/month</span>
       </div>
          <ul className="space-y-3">
              <li>🚀 unlimited PDFs per month</li>
            <li>🚀 unlimited chat prompts</li>
            <li>🚀 Max file size: 10MB</li>
          </ul>
             <button className="w-full mt-4 bg-blue-300 font-bold p-2 rounded-xl" onClick={()=>upgradePlan('premium')}>Upgrade to Premium</button>
           {planErrorPremium && (
            <p className="text-red-600 font-semibold text-sm mt-2">
              {planErrorPremium}
            </p>
          )}
       </div>
           </div>
    </div>
  )
}

export default Plans