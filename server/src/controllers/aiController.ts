import { Request, Response } from 'express'
import pdfParse from 'pdf-parse'
import { OpenAI } from 'openai'
import 'dotenv/config'
import type { IUser } from '../models/user_model'

interface AIRequest extends Request {
  usage?: {
    summariesLeft: number
    chatsLeft: number
    userDoc: IUser
  }
  file?: Express.Multer.File
}

const openAI = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY as string
})

export const chatAI = async (
  req: Request,
  res: Response
): Promise<Response> => {
    const aireq=req as AIRequest;
  const { prompt } = req.body
  if (!prompt) return res.status(400).json('prompt is required')

  const { userDoc, chatsLeft } = aireq.usage!

  if (chatsLeft <= 0) {
    return res
      .status(403)
      .json({ msg: 'limits reached upgrade the plan' })
  }

  if (chatsLeft !== Infinity) {
    userDoc.monthlyUsage.chatsUsed += 1
    await userDoc.save()
  }

  const aiResponse = await openAI.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'you are very helpful assistant' },
      { role: 'user', content: prompt }
    ]
  })

  return res.json({
    answer: aiResponse.choices[0]?.message.content
  })
}




export const summarizeAI = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const aireq =req as AIRequest
    const file = req.file
    const { prompt } = req.body

    if (!file) {
      return res.status(400).json('no file uploaded')
    }

    const { summariesLeft, userDoc } = aireq.usage!
    if (!userDoc) {
      return res.status(400).json({ msg: 'no user found' })
    }

    const data = await pdfParse(file.buffer)
    const extractedText = data.text

    if (summariesLeft <= 0) {
      return res
        .status(403)
        .json({ msg: 'limits exceeded ,upgrade the plan' })
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({
        message:
          'Could not extract text from PDF. The file might be corrupted or image-based.'
      })
    }

    const estimatedTokens = extractedText.length / 4

    if (estimatedTokens > 120000) {
      return res.status(400).json({
        message: 'PDF is too large to process. Please try a smaller file.',
        estimatedTokens: Math.round(estimatedTokens)
      })
    }

    const aiResponse = await openAI.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'You are a good and professional pdf summarizer and resume reviewer'
        },
        { role: 'user', content: `${prompt}\n\n${extractedText}` }
      ],
      model: 'gpt-4o-mini'
    })

    const summary = aiResponse.choices[0]?.message.content

    if (summariesLeft !== Infinity) {
      userDoc.monthlyUsage.summariesUsed += 1
      await userDoc.save()
    }

    return res.status(200).json({ summary })
  } catch (error) {
    return res.status(500).json({ error: 'failed to summarize the pdf' })
  }
}


