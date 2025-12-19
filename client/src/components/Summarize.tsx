import axios from 'axios'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'

const url = 'http://localhost:8000'
axios.defaults.withCredentials = true

interface ChatItem {
  user: string
  ai: string
}

const Summarize = () => {
  const [prompt, setPrompt] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)
  const [chats, setChats] = useState<ChatItem[]>([])
  const [isloading, setisLoading] = useState<boolean>(false)
  const [error, setError] = useState<boolean>(false)
  const [ocrError, setOcrError] = useState<boolean>(false)
  const [readError, setReadError] = useState<boolean>(false)
  const [typeError, setTypeError] = useState<boolean>(false)
  const [tokenLimitError, setTokenLimitError] = useState<boolean>(false)
  const [usage, setUsage] = useState<any>(null)

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const response = await axios.get(`${url}/api/ai/usage`)
        setUsage(response.data)
      } catch (error) {
        console.error('Failed to fetch usage:', error)
      }
    }
    fetchUsage()
  }, [isloading])

  const handleSubmit = async (): Promise<void> => {
    setOcrError(false)
    setReadError(false)
    setTokenLimitError(false)
    setError(false)
    setTypeError(false)
    try {
      if (!file) return;

      setisLoading(true)
      const formData = new FormData()
      formData.append('prompt', prompt)
      formData.append('file', file)

      const res = await axios.post(`${url}/api/ai/summarize`, formData)
      setChats(prev => [...prev, { user: prompt, ai: res.data.summary }])
      setPrompt('')
      setFile(null)
    } catch (error: any) {
       const msg=error.response.data.message
       if(msg==='This PDF appears to be scanned'){
        setOcrError(true)
       }else if(msg==='Unable to extract readable text from this PDF'){
        setReadError(true)
       }else if(msg==='PDF exceeds your monthly token limit'){
        setTokenLimitError(true)
       }else if(msg==='Only PDF files are allowed'){
        setTypeError(true)
       }else{
        setError(true)
       }
    } finally {
      setisLoading(false)
    }
  }


  return (
    <div className="min-h-[82.6vh] bg-[#f4f7fb] flex justify-center pt-10 px-4">

      <div className="w-full max-w-4xl bg-white border rounded-xl shadow-sm p-6 flex flex-col">

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Summarize PDFs
          </h2>
          <p className="text-sm text-gray-700">
           Summary Tokens Left: <strong>{usage?.summaryTokenLeft || 'Unlimited'}</strong>
          </p>
        </div>

        {(ocrError) && (
          <p className="text-red-600 text-sm text-center mb-2">
            This PDF appears to be scanned. OCR is available for Pro and Premium users
          </p>
        )}
        {(readError) && (
          <p className="text-red-600 text-sm text-center mb-2">
            Unable to extract readable text from this PDF
          </p>
        )}
        {(tokenLimitError) && (
          <p className="text-red-600 text-sm text-center mb-2">
            PDF exceeds your monthly token limit
          </p>
        )}
        {(error) && (
          <p className="text-red-600 text-sm text-center mb-2">
            Failed to summarize pdf
          </p>
        )}
        {(typeError) && (
          <p className="text-red-600 text-sm text-center mb-2">
            Only PDF files are allowed
          </p>
        )}

        {isloading && (
          <p className="text-center text-gray-700 font-medium mb-3">
            Summarizing...
          </p>
        )}


        <div className="flex-1 overflow-y-auto border rounded-lg p-4 mb-4 bg-[#fafbff] space-y-6">

          {chats.map((chat, idx) => (
            <div key={idx} className="space-y-2">

              <div className="flex justify-end">
                <div className="bg-black text-white px-4 py-2 rounded-lg text-sm max-w-[75%]">
                  {chat.user}
                </div>
              </div>

              <div className="flex justify-start">
                <div className="bg-white border px-4 py-3 rounded-lg text-sm text-gray-800 max-w-[90%]">
                  <ReactMarkdown
                    children={chat.ai}
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeSanitize]}
                  />
                </div>
              </div>

            </div>
          ))}

        </div>

   
        <div className="flex flex-col md:flex-row gap-3">

          <input
            type="file"
            accept='application/pdf'
            className="border p-2 rounded-lg bg-[#f9fbff]"
            onChange={(e) => setFile(e.target.files?.[0]??null)}
          />

          <textarea
            className="flex-1 border p-3 rounded-lg resize-none bg-[#f9fbff] focus:outline-none"
            placeholder="Enter something..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <button
            className="bg-black text-white px-6 py-3 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50"
            onClick={handleSubmit}
            disabled={isloading || !file  }
          >
            Summarize
          </button>

        </div>

      </div>
    </div>
  )
}

export default Summarize
