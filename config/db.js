import mongoose from 'mongoose';
import { configDotenv } from 'dotenv';
configDotenv();

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed', error);
    process.exit(1);
  }
};
