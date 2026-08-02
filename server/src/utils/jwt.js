// =======================================================
// jwt.js — Token Generation & Verification Utility
// =======================================================

import jwt from "jsonwebtoken";

const JWT_SECRET         = process.env.JWT_SECRET || "ai_engineer_os_super_secret_jwt_key_2026";
const JWT_EXPIRES_IN     = "15m";
const REFRESH_EXPIRES_IN = "7d";

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

export default { generateAccessToken, generateRefreshToken, verifyToken };
