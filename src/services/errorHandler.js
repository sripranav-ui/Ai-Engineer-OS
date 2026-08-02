import logger from "../utils/logger";

/**
 * Custom Error Class Hierarchy for SaaS integration
 */

export class ApiError extends Error {
  constructor(message, status, payload = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export class ValidationError extends Error {
  constructor(message, fields = {}) {
    super(message);
    this.name = "ValidationError";
    this.fields = fields; // e.g. { email: "Invalid email structure" }
  }
}

export class AuthError extends Error {
  constructor(message, code = "UNAUTHORIZED") {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}

export class NetworkError extends Error {
  constructor(message) {
    super(message);
    this.name = "NetworkError";
  }
}

export class UnknownError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = "UnknownError";
    this.originalError = originalError;
  }
}

/**
 * Centralized Error Orchestrator
 */
export const errorHandler = {
  handle: (err) => {
    logger.error(`[Central Error Handler] Caught exception of type: ${err.name}`, err);
    
    // Formatting standardized response for UI components
    const errorDetails = {
      message: err.message || "An unexpected error occurred in AI Engineer OS.",
      type: err.name,
      status: err.status || 500,
      timestamp: new Date().toISOString()
    };

    if (err instanceof ValidationError) {
      errorDetails.status = 422;
      errorDetails.fields = err.fields;
    } else if (err instanceof AuthError) {
      errorDetails.status = 401;
      errorDetails.code = err.code;
    } else if (err instanceof NetworkError) {
      errorDetails.status = 503;
    }

    return errorDetails;
  }
};

export default errorHandler;
