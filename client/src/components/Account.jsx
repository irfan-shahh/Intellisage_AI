import axios from 'axios'
import { useEffect,useState } from 'react'
import { useNavigate } from 'react-router-dom'
const url='http://localhost:8000'

axios.defaults.withCredentials=true

const Account =() => {
  const[usage,setUsage]=useState(null)
  const[loading,setLoading]=useState(false)
  const navigate=useNavigate()

  const cancelPlan=async ()=>{
    try{
      if(usage?.plan==='free'){
          navigate('/plans')
      }
      else{
      const response=await axios.get(`${url}/cancel`)
      window.location.href=response.data.url
      }
    }catch(error){
      console.log('error while cancelling plan',error)
    }

  }
   
  useEffect(() => {
    const fetchUsage = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${url}/api/ai/usage`);
        setUsage(response.data);
      } catch (error) {
        console.error('Failed to fetch usage:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
  }, []);

  return (
    <div className='h-[82.6vh] bg-blue-200'>
        <div className='flex justify-center items-center pt-4 text-2xl '>
         <p className='mr-2 p-2 '>  Your Plan:<strong>{usage?.plan}</strong></p>
         <p className='mr-2 p-2'> Chats Left:<strong>{usage?.chatsLeft ||'Unlimited'}</strong></p> 
         <p className='mr-2 p-2'> Summaries Left:<strong>{usage?.summariesLeft ||'Unlimited'}</strong></p>
         
    <button
      className='text-md ml-auto pr-4 text-red-700 bg-white rounded-lg p-2'
      onClick={cancelPlan}>
       {usage?.plan === 'free' ? 'Upgrade the plan !' : 'Manage Plan'}
    </button>
    </div>
    </div>
  )
}

export default Account