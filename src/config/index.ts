import { connectDB, disconnectDB, isConnected } from "./mongodb";
import { generateToken, generateRefreshToken, verifyToken } from "./auth";
import dotenv from "dotenv";

dotenv.config();

// Environment variables
export const config = {
  // Server configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database configuration
  MONGODB_URL: process.env.MONGODB_URL || 'mongodb://localhost:27017/jobs_api',
  
  // JWT configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  JWT_EXP_IN: process.env.JWT_EXP_IN || '1d',
  JWT_REFRESH_EXP_IN: process.env.JWT_REFRESH_EXP_IN || '7d',
  
  // CORS configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
};

// لا تقم بتصدير الدوال من هنا
// export { connectDB, disconnectDB, isConnected };
// export { generateToken, generateRefreshToken, verifyToken };
// export default config; // التصدير الافتراضي غير ضروري إذا كنت تستخدم التصدير المسمى

