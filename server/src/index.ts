import express, { Application } from 'express'
import connectDB from './db/connection'
import appRouter from './routes/route'
import aiRouter from './routes/aiRoute'
import webhookRoute from './routes/webhook'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import 'dotenv/config'


const app: Application = express()


app.use(
  '/webhook',
  express.raw({ type: 'application/json' }),
  webhookRoute
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true
  })
)

app.use('/', appRouter)
app.use('/api/ai/', aiRouter)

const port = 8000

const start = async (): Promise<void> => {
  await connectDB(process.env.MONGO_URI as string)

  app.listen(port, () => {
    console.log(`server is running on the port ${port}`)
  })
}

start()
