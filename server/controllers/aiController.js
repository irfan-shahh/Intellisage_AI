require('dotenv').config()
const pdfParse = require('pdf-parse')
const { OpenAI } = require('openai')



const openAI = new OpenAI({ apiKey: process.env.OPEN_AI_KEY })

const chatAI = async (req, res) => {
    try {
        const { prompt } = req.body
        if (!prompt) {
            return res.status(400).json('prompt is required')
        }
        const { userDoc, chatsLeft } = req.usage
        if (!userDoc) {
            return res.status(400).json({ msg: 'no user found' })
        }
        if (chatsLeft <= 0) {
            return res.status(403).json({ msg: "limits reached upgrade the plan" })
        }
        if (chatsLeft !== Infinity) {
            userDoc.monthlyUsage.chatsUsed +=1
            userDoc.save()
        }

        const aiResponse = await openAI.chat.completions.create({
            messages: [
                { role: 'system', content: 'you are very helpful assistant' },
                { role: 'user', content: prompt },
            ],
            model: 'gpt-4o-mini'
        })
        const answer = aiResponse.choices[0].message.content;
        return res.status(200).json({ answer })
    } catch (error) {
        return res.status(500).json({ error: 'failed to get AI response' })
    }
}

const summarizeAI = async (req, res) => {
    try {

        const file = req.file;
        const { prompt } = req.body

        if (!file) {
            return res.status(400).json('no file uploaded')
        }
        const { summariesLeft, userDoc } = req.usage
        if (!userDoc) {
            return res.status(400).json({ msg: 'no user found' })
        }
        const data = await pdfParse(file.buffer)
        const extractedText = data.text
        if (summariesLeft <= 0) {
            return res.status(403).json({ msg: 'limits exceeded ,upgrade the plan' })
        }
           if (!extractedText || extractedText.trim().length === 0) {
                return res.status(400).json({ message: 'Could not extract text from PDF. The file might be corrupted or image-based.' })
           }

        const estimatedTokens = extractedText.length / 4;

        if (estimatedTokens > 120000) {
            return res.status(400).json({
                message: 'PDF is too large to process. Please try a smaller file.',
                estimatedTokens: Math.round(estimatedTokens)
            });
        }

        const aiResponse = await openAI.chat.completions.create({
            messages: [
                { role: 'system', content: 'You are a good and professional pdf summarizer and resume reviewer' },
                { role: 'user', content: `${prompt}\n\n${extractedText}` },
            ],
            model: 'gpt-4o-mini'
        })

        const summary = await aiResponse.choices[0].message.content

        if (summariesLeft !== Infinity) {
            userDoc.monthlyUsage.summariesUsed += 1
            await userDoc.save()
        }
        return res.status(200).json({ summary })

    } catch (error) {
        return res.status(500).json({ error: 'failed to summarize the pdf' })
    }
}



module.exports = { chatAI, summarizeAI }
