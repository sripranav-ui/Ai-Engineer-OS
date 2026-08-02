import logger from "../utils/logger";

const MAX_LOG_SIZE = 500;
const LOGS_STORAGE_KEY = "ai_engineer_os_monitoring_logs";

export const LogCategory = {
  APPLICATION: "APPLICATION",
  USER_ACTIVITY: "USER_ACTIVITY",
  PERFORMANCE: "PERFORMANCE",
  API: "API",
  ERROR: "ERROR"
};

class TelemetryMonitoringService {
  constructor() {
    this.debugMode = localStorage.getItem("monitoring_debug_mode") === "true";
    this.logs = this.loadLogs();
  }

  loadLogs() {
    try {
      const stored = localStorage.getItem(LOGS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  saveLogs() {
    try {
      localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(this.logs.slice(0, MAX_LOG_SIZE)));
    } catch (err) {
      logger.warn("[MonitoringService] Failed to persist logs to localStorage:", err);
    }
  }

  log(category, message, metadata = null) {
    const logItem = {
      id: "log_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toISOString(),
      category,
      message,
      metadata
    };

    this.logs = [logItem, ...this.logs].slice(0, MAX_LOG_SIZE);
    this.saveLogs();

    // Print to developer console based on debug state
    if (this.debugMode || category === LogCategory.ERROR) {
      const color = this.getCategoryColor(category);
      console.log(
        `%c[${category}]%c ${message}`,
        `color: ${color}; font-weight: bold;`,
        "",
        metadata || ""
      );
    }

    // Trigger external integrations (Sentry, PostHog, LogRocket integration architecture ready)
    this.dispatchToExternalIntegrations(logItem);
  }

  getCategoryColor(category) {
    switch (category) {
      case LogCategory.ERROR: return "#ef4444";
      case LogCategory.API: return "#f59e0b";
      case LogCategory.PERFORMANCE: return "#10b981";
      case LogCategory.USER_ACTIVITY: return "#8b5cf6";
      default: return "#3b82f6";
    }
  }

  toggleDebugMode(enabled) {
    this.debugMode = enabled;
    localStorage.setItem("monitoring_debug_mode", String(enabled));
    this.log(LogCategory.APPLICATION, `Debug mode toggled to: ${enabled}`);
  }

  clearLogs() {
    this.logs = [];
    localStorage.removeItem(LOGS_STORAGE_KEY);
    this.log(LogCategory.APPLICATION, "Telemetry logs cleared.");
  }

  getLogs() {
    return this.logs;
  }

  /**
   * Enterprise Integrations Dispatcher (Sentry, PostHog, LogRocket)
   */
  dispatchToExternalIntegrations(logItem) {
    const { category, message, metadata } = logItem;

    // 1. PostHog Event Tracking Placeholder
    if (category === LogCategory.USER_ACTIVITY) {
      // posthog.capture(message, { ...metadata, platform: 'AI-Engineer-OS' });
    }

    // 2. Sentry Exception Capture Placeholder
    if (category === LogCategory.ERROR) {
      // Sentry.captureException(new Error(message), { extra: metadata });
    }

    // 3. LogRocket Recording Logs Placeholder
    // LogRocket.log(`[${category}] ${message}`, metadata);
  }

  // Shorthand helpers
  app(message, meta) { this.log(LogCategory.APPLICATION, message, meta); }
  activity(message, meta) { this.log(LogCategory.USER_ACTIVITY, message, meta); }
  perf(message, meta) { this.log(LogCategory.PERFORMANCE, message, meta); }
  api(message, meta) { this.log(LogCategory.API, message, meta); }
  error(message, meta) { this.log(LogCategory.ERROR, message, meta); }
}

export const monitoringService = new TelemetryMonitoringService();
export default monitoringService;
