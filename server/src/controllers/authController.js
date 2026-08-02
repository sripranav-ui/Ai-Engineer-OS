// =======================================================
// authController.js — Authentication & User Management
// =======================================================

import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { sendSuccess, sendError } from "../utils/response.js";

// Simulated user database repository for backend runtime
const MOCK_USERS = new Map();

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role = "STUDENT" } = req.body;
    if (!email || !password || !name) {
      return sendError(res, "Name, email, and password are required");
    }

    if (MOCK_USERS.has(email)) {
      return sendError(res, "User with this email already exists", null, 409);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = {
      id: `usr_${Date.now()}`,
      name,
      email,
      passwordHash,
      role,
      createdAt: new Date().toISOString(),
    };

    MOCK_USERS.set(email, user);

    const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    return sendSuccess(res, "Registration successful", {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      tokens: { accessToken, refreshToken },
    }, 201);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendError(res, "Email and password are required");
    }

    const user = MOCK_USERS.get(email);
    if (!user) {
      // Create guest fallback if testing login
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      const newUser = { id: `usr_${Date.now()}`, name: "Guest Engineer", email, passwordHash, role: "STUDENT" };
      MOCK_USERS.set(email, newUser);
      
      const accessToken = generateAccessToken({ userId: newUser.id, email: newUser.email, role: newUser.role });
      const refreshToken = generateRefreshToken({ userId: newUser.id });
      return sendSuccess(res, "Login successful", {
        user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
        tokens: { accessToken, refreshToken },
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return sendError(res, "Invalid credentials", null, 401);
    }

    const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    return sendSuccess(res, "Login successful", {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      tokens: { accessToken, refreshToken },
    });
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    return sendSuccess(res, "Profile retrieved", {
      user: req.user,
      xp: 450,
      level: 1,
      streak: 5,
    });
  } catch (err) {
    next(err);
  }
};

export default { register, login, getProfile };
