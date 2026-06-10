import mongoose from 'mongoose';

export let isDBConnected = false;

/**
 * MongoDB Database Connection Manager
 * Integrates Mongoose connection hooks with fallback configurations.
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ai-stock-predictor', {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`⚡ [Database] MongoDB Connected: ${conn.connection.host}`);
    isDBConnected = true;
    return true;
  } catch (error) {
    console.warn(`⚠️ [Database] MongoDB connection refused: ${error.message}`);
    console.log(`💡 [Database] Running in Sandbox Mode. Local in-memory repository fallbacks enabled.`);
    isDBConnected = false;
    return false;
  }
};


