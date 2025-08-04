import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
const jwtExpiry = process.env.JWT_EXP_IN || '7d';
const jwtRefreshExpiry = process.env.JWT_REFRESH_EXP_IN || '30d';

// Generate Access Token
export const generateToken = (userId: string): string => {
  const payload = { userId };
  // @ts-ignore - JWT types are conflicting, but this works correctly
  return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiry });
};

// Generate Refresh Token
export const generateRefreshToken = (userId: string): string => {
  const payload = { userId };
  // @ts-ignore - JWT types are conflicting, but this works correctly
  return jwt.sign(payload, jwtSecret, { expiresIn: jwtRefreshExpiry });
};

// Verify Token
export const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, jwtSecret);
    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};
