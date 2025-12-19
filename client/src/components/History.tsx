import axios from 'axios'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'

const History = () => {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState<'chat' | 'summary'>('chat')
    const [type, setType] = useState<'chat' | 'summary'>('chat')
    const [from, setFrom] = useState('')
    const [to, setTo] = useState('')
    const [upgradeError, setUpgradeError] = useState<boolean>(false)
    const [history, setHistory] = useState<any[]>([])

    axios.defaults.withCredentials = true;

    useEffect(() => {
        const fetchHistory = async () => {
            try {

                const response = await axios.get('http://localhost:8000/history', { params: { type, from, to } })
                setHistory(response.data)
            } catch (error: any) {
                const msg = error.response.data.message
                if (msg === 'Upgrade to view history') {
                    setUpgradeError(true)
                }
            }
        }
        fetchHistory()

    }, [type])




    return (
        <div className="min-h-[82.6vh] bg-[#f4f7fb] flex justify-center px-4 pt-10">
            <div className="w-full max-w-4xl bg-white border rounded-xl shadow-sm p-8">


                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800">
                        History
                    </h2>

                    <button
                        onClick={() => navigate(-1)}
                        className="text-sm font-semibold text-gray-600 hover:underline"
                    >
                        ← Back
                    </button>
                </div>


                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => { setActiveTab('chat'); setType('chat'); }}
                        className={`px-5 py-2 rounded-lg text-sm font-semibold border transition
              ${activeTab === 'chat'
                                ? 'bg-black text-white'
                                : 'bg-[#eef3ff] text-gray-800 hover:bg-[#dde7ff]'
                            }`}
                    >
                        Chat History
                    </button>

                    <button
                        onClick={() => { setActiveTab('summary'); setType('summary'); }}
                        className={`px-5 py-2 rounded-lg text-sm font-semibold border transition
              ${activeTab === 'summary'
                                ? 'bg-black text-white'
                                : 'bg-[#eef3ff] text-gray-800 hover:bg-[#dde7ff]'
                            }`}
                    >
                        Summary History
                    </button>
                </div>


                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <input
                        type="date"
                        onChange={(e) => setFrom(e.target.value)}
                        className="border rounded-lg p-3 bg-[#f9fbff]"
                    />
                    <input
                        type="date"
                        onChange={(e) => setTo(e.target.value)}
                        className="border rounded-lg p-3 bg-[#f9fbff]"
                    />
                    <button className="px-6 py-3 rounded-lg text-sm font-semibold border bg-black text-white">
                        Filter
                    </button>
                </div>

                <div className="space-y-6 max-h-[55vh] overflow-y-auto pr-2">
                    {
                        upgradeError && <h5 className="text-red-400 mb-2 text-center">Upgrade to persist and view history</h5>
                    }
                    {history.length === 0 && !upgradeError && (
                        <p className="text-center text-gray-500">
                            No history found
                        </p>
                    )}

                    {history.map((h) => (
                        <div
                            key={h._id}
                            className="border rounded-lg p-5 bg-[#fafcff]"
                        >
                            <p className="text-xs text-gray-500 mb-2">
                                {new Date(h.createdAt).toLocaleString()}
                            </p>
                            {h.fileName && (
                                <p className="text-xs text-gray-600 mb-2">
                                    📄 {h.fileName}
                                </p>
                            )}

                            <div className="bg-black text-white px-4 py-2 rounded-lg text-sm inline-block mb-3">
                                {h.prompt}
                            </div>

                            <div className="border rounded-lg px-4 py-3 text-sm text-gray-800 bg-white">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[rehypeSanitize]}
                                >

                                    {h.response || h.summary}
                                </ReactMarkdown>
                            </div>
                        </div>
                    ))}

                </div>

            </div>
        </div>
    )
}

export default History
