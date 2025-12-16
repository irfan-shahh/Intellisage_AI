const mongoose=require('mongoose')

const connectDB=async (url)=>{
    return await mongoose.connect(url).then(()=>{
        console.log('connected to the db')
    }).catch((error)=>{
        console.log('error while connecting db',error)
    })
}
module.exports=connectDB;