/**
 * @file runtimeErrors.js
 * @description Structured Error Architecture for AI Engineer OS Runtime Integration Layer.
 */

import { redactSecrets } from "./runtimeProtocol.js";

export const RUNTIME_ERROR_CODES = {
  RUNTIME_UNAVAILABLE: "RUNTIME_UNAVAILABLE",
  AUTHENTICATION_FAILURE: "AUTHENTICATION_FAILURE",
  AUTHORIZATION_FAILURE: "AUTHORIZATION_FAILURE",
  INVALID_REQUEST: "INVALID_REQUEST",
  INVALID_OPERATION: "INVALID_OPERATION",
  WORKSPACE_VIOLATION: "WORKSPACE_VIOLATION",
  COMMAND_BLOCKED: "COMMAND_BLOCKED",
  FILESYSTEM_FAILURE: "FILESYSTEM_FAILURE",
  GIT_FAILURE: "GIT_FAILURE",
  TIMEOUT: "TIMEOUT",
  PROTOCOL_FAILURE: "PROTOCOL_FAILURE",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
};

export class RuntimeError extends Error {
  /**
   * @param {string} code - Error code from RUNTIME_ERROR_CODES
   * @param {string} message - Human readable sanitized description
   * @param {string} [operation] - Operation key
   * @param {Object} [details] - Sanitized details payload
   */
  constructor(code, message, operation = "unknown", details = {}) {
    const sanitizedMsg = redactSecrets(message || "Runtime error occurred");
    super(sanitizedMsg);
    this.name = "RuntimeError";
    this.code = code || RUNTIME_ERROR_CODES.UNKNOWN_ERROR;
    this.operation = operation;
    this.details = typeof details === "object" ? details : { raw: String(details) };
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      operation: this.operation,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}

/**
 * Helper to construct a structured RuntimeError instance
 * @param {string} code
 * @param {string} message
 * @param {string} [operation]
 * @param {Object} [details]
 * @returns {RuntimeError}
 */
export function createRuntimeError(code, message, operation = "unknown", details = {}) {
  return new RuntimeError(code, message, operation, details);
}

/**
 * Check if object is a RuntimeError instance
 * @param {any} err
 * @returns {boolean}
 */
export function isRuntimeError(err) {
  return err instanceof RuntimeError || (err && err.name === "RuntimeError" && Boolean(err.code));
}

export default {
  RUNTIME_ERROR_CODES,
  RuntimeError,
  createRuntimeError,
  isRuntimeError,
};
