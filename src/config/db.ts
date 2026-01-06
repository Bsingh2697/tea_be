import mongoose from 'mongoose';

export const connectDB = async() => {
    try{
        await mongoose.connect(process.env.DATABASE_URL!)
        console.log("✅ MongoDB Connected")
    } catch(err){
        console.log("❌ Connection Failure")
        process.exit(1)
    }
}