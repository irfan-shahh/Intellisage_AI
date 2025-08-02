const express=require('express')
const connectDB=require('./db/connection')
const appRouter=require('./routes/route')
const aiRouter=require('./routes/aiRoute')
const webhookRoute=require('./routes/webhook')
require('dotenv').config()
require('./utils/cron')
const cors=require('cors')
const cookieParser = require('cookie-parser')

const app=express()
app.use('/webhook',express.raw({type:'application/json'}),webhookRoute)
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(cors({
    origin:'http://localhost:3000',
    credentials:true
}))

app.use('/',appRouter)
app.use('/api/ai/',aiRouter)
const port=8000

const start=async()=>{
    await connectDB(process.env.MONGO_URI)
    app.listen(port ,()=>{
        console.log(`server is running on the port ${port}`)
    })
}
start()


