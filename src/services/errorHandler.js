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

    // Provider & AI Specific Actionable Guidance
    let userFriendly = errorDetails.message;
    if (err.message && (err.message.includes("apiKey") || err.message.includes("API key") || err.message.includes("401"))) {
      userFriendly = "API key missing or invalid. Please configure your key in Settings → AI Providers.";
    } else if (err.message && (err.message.includes("429") || err.message.includes("Rate limit") || err.message.includes("Quota"))) {
      userFriendly = "Rate limit or quota exceeded for the active AI Provider. Please retry shortly or switch providers.";
    } else if (err.message && err.message.includes("Ollama") && (err.message.includes("Failed to fetch") || err.message.includes("connect"))) {
      userFriendly = "Could not connect to local Ollama instance at http://localhost:11434. Ensure Ollama is running.";
    }

    errorDetails.userFriendly = userFriendly;
    return errorDetails;
  }
};

export default errorHandler;
