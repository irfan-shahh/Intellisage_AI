import { useState,useEffect } from "react"
import axios from "axios"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
const url = 'http://localhost:8000'

axios.defaults.withCredentials = true
const Chat = () => {
  
  const [prompt, setPrompt] = useState('')
  const [chats, setChats] = useState([])
  const [isloading, setisLoading] = useState(false)

  const[usage,setUsage]=useState(null)
  const[error,setError]=useState(false)
   
  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const response = await axios.get(`${url}/api/ai/usage`);
        setUsage(response.data);
      } catch (error) {
        console.error('Failed to fetch usage:', error);
      } 
    };

    fetchUsage();
  }, []);


  const handleSubmit = async () => {
    try {
      setisLoading(true)
      const res = await axios.post(`${url}/api/ai/chat`, { prompt })
      const aiReply = res.data.answer
      setChats(prev => [...prev, { user: prompt, ai: aiReply }])
      setPrompt('')

    } catch (error) {
      if(error.response.status===403){
        setError(true)
      }
      else{

        console.log('error while generating response', error)
      }
    }
    finally {
      setisLoading(false)
    }
  }

  return (
    
    <div className='flex flex-col pt-10 items-center bg-blue-200 h-[82.6vh] '>
      <p className="ml-auto pr-4"> Chats Left:<strong> {usage?.chatsLeft || 'Unlimited'}</strong></p>
      {
        error && <p className="text-red-700 text-sm">Limits reached,kindly upgrade your plan</p>
      }
      <h1 className='font-bold text-2xl mb-4'>Ask Intellisage</h1>
      {
        isloading && 
        <h5 className="font-semibold text-2xl mt-10 mb-6">⏳Generating response..</h5>
      }

      {chats.map(chat => (
        <div className="overflow-auto hide-scrollbar border-gray-600">
          <div className=" md:w-[30vw] ml-96 mt-4 text-sm font-semibold text-gray-700">
            {chat.user}
            
          </div>

          <div className="md:w-[50vw] text-sm font-semibold mt-6 mb-2">
            <ReactMarkdown
                children={chat.ai}
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize]}
              />

          </div>

        </div>
      ))
      }

      <div className='mt-12 flex mb-6'>
        <textarea rows={4} placeholder='Ask anything' className='outline-none bg-slate-200 p-2 w-[40vw] h-12 rounded-lg overflow-auto'
          value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        <button className='w-[70px] p-2 bg-slate-400 rounded-lg font-semibold ' onClick={handleSubmit} disabled={isloading} >Ask</button>
       
      </div>

    </div>
  )
}

export default Chat




