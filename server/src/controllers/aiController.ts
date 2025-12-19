import { Request, Response } from 'express'
import pdfParse from 'pdf-parse'
import { OpenAI } from 'openai'
import 'dotenv/config'
import type { IUser } from '../models/user_model'
import ChatHistory from '../models/chatHistory_model'
import summaryHistory from '../models/summaryHistory_model'
import { countTokens } from '../utils/countToken'
import { ocrPdf } from '../utils/ocrPdf'
import fs from 'fs-extra'
import path from 'path'

interface AIRequest extends Request {
  usage?: {
    summaryTokenLeft: number
    chatTokenLeft: number
    userDoc: IUser
  }
  file?: Express.Multer.File
}

const openAI = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY as string
})

export const chatAI = async ( req: Request, res: Response): Promise<Response> => {
  try {
    const aireq = req as AIRequest;
  const { prompt } = req.body
  const userId = aireq.usage?.userDoc._id
  const plan = aireq.usage?.userDoc.plan
  if (!prompt || !prompt.trim()) return res.status(400).json('prompt is required')



  const { userDoc, chatTokenLeft } = aireq.usage!
  const promptTokens=countTokens(prompt)

  const systemPrompt = `
You are an expert assistant.
Give clear, structured, concise answers.
Use bullet points where helpful.
Avoid unnecessary filler.
`
     
  if (chatTokenLeft !== Infinity && promptTokens>chatTokenLeft) {
    return res.status(403).json({
        message: 'Chat token limit exceeded for this month'
      })
  }
  const aiResponse = await openAI.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ]
  })
  const answer = aiResponse.choices[0]?.message.content;
  const responseTokens=countTokens(answer!)
  const totalTokens=promptTokens+responseTokens;


  userDoc.monthlyUsage.chatTokenUsed+=totalTokens;
   await userDoc.save()

  if (plan === 'pro' || plan === 'premium') {
    await ChatHistory.create({
      user: userDoc._id,
      prompt,
      response: answer,
      tokenCount:totalTokens
    })
  }
  return res.json({
    answer
  })
    
  } catch (error) {
    return res.json({message:'error generating response'})
  }
  
}




export const summarizeAI = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const aireq = req as AIRequest
    const file = req.file
    const { prompt } = req.body
    const userId = aireq.usage?.userDoc._id
    const plan = aireq.usage?.userDoc.plan

    const systemPrompt = `
You are a document summarization assistant.

Rules:
- Summarize only the text content provided
-if able to detect text using ocr summarize it
- If document contains images or scanned pages, mention limitations
- Provide structured summary:
  • Overview
  • Key Points
  • Conclusion
`


    if (!file) {
      return res.status(400).json('no file uploaded')
    }
    if(file.mimetype!=='application/pdf'){
       return res.status(400).json({
    message: 'Only PDF files are allowed'
  })
    }

    const { summaryTokenLeft, userDoc } = aireq.usage!
    if (!userDoc) {
      return res.status(400).json({ msg: 'no user found' })
    }

      const data = await pdfParse(file.buffer)
    let extractedText = data.text
    const isScannedPdf = !extractedText || extractedText.trim().length < 30;
    if(isScannedPdf){
       if (plan === 'free') {
        return res.status(400).json({
          message:
            'This PDF appears to be scanned'
        })
      }
     
      extractedText=await ocrPdf(file.buffer);

      if (!extractedText || extractedText.trim().length ===0) {
        return res.status(400).json({
          message: 'Unable to extract readable text from this PDF'
        })
      }
    }

    const tokens=countTokens(extractedText)
   

    if (summaryTokenLeft !==Infinity && tokens>summaryTokenLeft) {
      return res
        .status(403)
        .json({ message: 'PDF exceeds your monthly token limit' })
    }
    const aiResponse = await openAI.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
           systemPrompt
        },
        { role: 'user', content: `${prompt}\n\n${extractedText}` }
      ],
      model: 'gpt-4o-mini'
    })

    const summary = aiResponse.choices[0]?.message.content
     const responseTokens=countTokens(summary!)
     const totalTokens=tokens+responseTokens
    userDoc.monthlyUsage.summaryTokenUsed+=totalTokens;
    await userDoc.save()

    if (plan === 'pro' || plan === 'premium') {
      await summaryHistory.create({
        user: userId,
        prompt,
        summary,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        tokenCount:totalTokens
      })
    }

       
    return res.status(200).json({ summary })
    
  } catch (error) {
    console.log("summmary error " ,error)
    return res.status(500).json({ message: 'failed to summarize the pdf' })
}
}
