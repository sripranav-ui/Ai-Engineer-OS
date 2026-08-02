/**
 * @file ragLogger.js
 * @description Centralized RAG Logging Utility for AI Engineer OS.
 * Provides structured log levels (info, warn, error, debug) for all RAG pipeline services.
 * Ensures a single point of control for logging and error reporting without scattered console calls.
 *
 * Responsibilities:
 * - Formats log messages with standard prefix and severity icons.
 * - Handles variable arguments for detailed diagnostic output.
 * - Provides consistent logging interface across all RAG services.
 *
 * Public API:
 * - info(message: string, ...args: any[]): void
 * - warn(message: string, ...args: any[]): void
 * - error(message: string, ...args: any[]): void
 * - debug(message: string, ...args: any[]): void
 *
 * Example Usage:
 * ```javascript
 * import ragLogger from "./ragLogger.js";
 * ragLogger.info("IndexedDB database initialized successfully");
 * ragLogger.error("Failed to save chunk vector", errorPayload);
 * ```
 */

export class RAGLogger {
  /**
   * Initializes logger with a specific module prefix.
   * @param {string} [prefix="[LocalRAG]"] - Logging prefix badge.
   */
  constructor(prefix = "[LocalRAG]") {
    this.prefix = prefix;
  }

  /**
   * Logs informational messages.
   * @param {string} message - Primary log message.
   * @param {...*} args - Contextual arguments or objects.
   */
  info(message, ...args) {
    console.log(`${this.prefix} ℹ️ ${message}`, ...args);
  }

  /**
   * Logs warning messages.
   * @param {string} message - Warning message.
   * @param {...*} args - Contextual arguments or objects.
   */
  warn(message, ...args) {
    console.warn(`${this.prefix} ⚠️ ${message}`, ...args);
  }

  /**
   * Logs error messages and trace details.
   * @param {string} message - Error description.
   * @param {...*} args - Error objects or stack traces.
   */
  error(message, ...args) {
    console.error(`${this.prefix} ❌ ${message}`, ...args);
  }

  /**
   * Logs debug/telemetry messages.
   * @param {string} message - Debug details.
   * @param {...*} args - Debug payload.
   */
  debug(message, ...args) {
    console.debug(`${this.prefix} 🔍 ${message}`, ...args);
  }
}

export const ragLogger = new RAGLogger();
export default ragLogger;
