// =======================================================
// errorHandler.js — Global Enterprise Error Middleware
// =======================================================

import { sendError } from "../utils/response.js";

export const globalErrorHandler = (err, req, res, next) => {
  console.error("[ServerError] Intercepted unhandled exception:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  return sendError(res, message, process.env.NODE_ENV === "development" ? err.stack : null, statusCode);
};

export default globalErrorHandler;
