import { useEffect, useState } from 'react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'

const url = 'http://localhost:8000'
axios.defaults.withCredentials = true

interface ChatItem {
  user: string
  ai: string
}

interface Usage {
  chatTokenLeft: number | string
}

const Chat = () => {
  const [prompt, setPrompt] = useState<string>('')
  const [chats, setChats] = useState<ChatItem[]>([])
  const [isloading, setisLoading] = useState<boolean>(false)
  const [usage, setUsage] = useState<Usage | null>(null)
  const [error,setError]=useState<boolean>(false)
  const [errorExceed, setErrorExceed] = useState<boolean>(false)

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
    setError(false)
    setErrorExceed(false)
    try {
      setisLoading(true)
      const res = await axios.post(`${url}/api/ai/chat`, { prompt })
      setChats(prev => [...prev, { user: prompt, ai: res.data.answer }])
      setPrompt('')
    } catch (error: any) {
      const msg=error.response.data.message
      if(msg==='Chat token limit exceeded for this month'){
          setErrorExceed(true)
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
        <div className="flex justify-between mb-4 text-sm text-gray-700">
          <h2 className="font-semibold text-gray-900 text-lg">
            Ask Intellisage
          </h2>
          <p>
           Chat Tokens Left: <strong>{usage?.chatTokenLeft || 'Unlimited'}</strong>
          </p>
        </div>

        {errorExceed && (
          <p className="text-red-600 text-sm text-center mb-2">
            Chat token limit exceeded for this month.
          </p>
        )}
        {error && (
          <p className="text-red-600 text-sm text-center mb-2">
            Error while generating response.
          </p>
        )}

        <div className="flex-1 overflow-y-auto border rounded-lg p-4 mb-4 bg-[#fafbff] space-y-6">
          {isloading && (
            <p className="text-center text-gray-700 font-medium">
              Generating response...
            </p>
          )}

          {chats.map((chat, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex justify-end">
                <div className="bg-black text-white px-4 py-2 rounded-lg text-sm max-w-[75%]">
                  {chat.user}
                </div>
              </div>

              <div className="flex justify-start">
                <div className="bg-white border px-4 py-3 rounded-lg text-sm text-gray-800 max-w-[85%]">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeSanitize]}
                  >
                    {chat.ai}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 items-center">
          <textarea
            className="flex-1 border rounded-lg p-3 resize-none bg-[#f9fbff]"
            value={prompt}
            placeholder='Enter something...'
            onChange={e => setPrompt(e.target.value)}
          />

          <button
            className="bg-black text-white px-6 py-3 rounded-lg text-sm font-semibold disabled:opacity-50"
            onClick={handleSubmit}
            disabled={!prompt}
          >
            Ask
          </button>
        </div>
      </div>
    </div>
  )
}

export default Chat
