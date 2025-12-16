import mongoose from 'mongoose'

const connectDB = async (url: string): Promise<void> => {
  try {
    await mongoose.connect(url)
    console.log('connected to the db')
  } catch (error) {
    console.log('error while connecting db', error)
  }
}

export default connectDB
