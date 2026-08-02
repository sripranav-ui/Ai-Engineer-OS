// =======================================================
// authMiddleware.js — JWT & RBAC Verification Middleware
// =======================================================

import { verifyToken } from "../utils/jwt.js";
import { sendError } from "../utils/response.js";

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, "Unauthorized access token missing", null, 401);
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return sendError(res, "Invalid or expired access token", null, 401);
  }
};

export const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return sendError(res, "Forbidden: Insufficient privileges", null, 403);
    }
    next();
  };
};

export default { authenticate, authorize };
