import axios from "axios"
import { useState,useEffect } from "react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
const url = 'http://localhost:8000'

axios.defaults.withCredentials = true

const Summarize = () => {
  const [prompt, setPrompt] = useState('')
  const [file, setFile] = useState(null)
  const [chats, setChats] = useState([])
  const [isloading, setisLoading] = useState(false)
  const [error,setError]=useState(false)
  const [sizeError,setsizeError]=useState(false)


  const[usage,setUsage]=useState(null)
   
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
       const fileSizeInMB = file.size / (1024 * 1024)
    const maxSize = usage?.plan === 'free' ? 2 : 10
    
    if (fileSizeInMB > maxSize) {
    setsizeError(`File size (${fileSizeInMB.toFixed(2)}MB) exceeds the ${maxSize}MB limit for your ${usage?.plan || 'current'} plan.`)
      return
    }
      setisLoading(true)
      const formData = new FormData()
      formData.append('prompt', prompt)
      formData.append('file', file)
      const res = await axios.post(`${url}/api/ai/summarize`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const aiSummary = res.data.summary
      setChats(prev => [...prev, { user: prompt, ai: aiSummary }])
      setPrompt('')
      setFile(null)

    } catch (error) {
      if(error?.response.status===413){
        setError(true)
      }
      else{
        console.log('error while generating summary from ai', error)
      }
    }
    finally {
      setisLoading(false)
    }
  }
  return (
    <div className='flex flex-col pt-10 items-center bg-blue-200 h-[82.6vh] '>
      <h1 className='font-bold text-2xl mb-4'> Summarize pdfs using Intellisage</h1>
       {
        error && (
          <p className="text-red-700 text-sm mt-2">
               {
                usage?.plan==='free' ?"Limits reached or file too large (Max 2MB for Free plan)":
                'Limits reached for the file too large'
               }
          </p>
        )
       }
       {
       sizeError && (
          <p className="text-red-700 text-sm mt-2">
               {
                usage?.plan==='free' ?"Limits reached or file too large (Max 2MB for Free plan)":
                'Limits reached for the file too large'
               }
          </p>
        )
       }

      {
        error && <p className="text-red-700 text-sm">Limits reached,kindly upgrade your plan</p>
      }
      <p className="ml-auto pr-4"> Summaries Left:<strong> {usage?.summariesLeft || 'Unlimited'}</strong></p>
      {
        isloading &&(
        <h5 className="font-semibold text-2xl mt-10 mb-4">⏳Summarizing..</h5>)
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
      <div className='mt-12 flex  items-center'>
        <input type='file' className='ml-0 w-52' onChange={(e) => setFile(e.target.files[0])}  />
        <textarea rows={4} placeholder='Enter prompt' className='outline-none bg-slate-200 p-2 w-[30vw] h-12 rounded-lg overflow-auto'
          value={prompt} onChange={(e) => setPrompt(e.target.value)}></textarea>
        <button className='w-[95px] p-2 bg-slate-400 rounded-lg font-semibold ' onClick={handleSubmit} disabled={isloading} >Summarize</button>
      </div>
      

    </div>
  )
}

export default Summarize