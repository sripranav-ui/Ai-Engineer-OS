/**
 * Unified Debug Logger Utility
 */
const PREFIX = "[AI-Engineer-OS]";

export const logger = {
  info: (message, ...args) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(`%c${PREFIX} [INFO]%c`, "color: #3b82f6; font-weight: bold;", "", message, ...args);
    }
  },
  warn: (message, ...args) => {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`%c${PREFIX} [WARN]%c`, "color: #f59e0b; font-weight: bold;", "", message, ...args);
    }
  },
  error: (message, ...args) => {
    console.error(`%c${PREFIX} [ERROR]%c`, "color: #ef4444; font-weight: bold;", "", message, ...args);
  }
};

export default logger;
