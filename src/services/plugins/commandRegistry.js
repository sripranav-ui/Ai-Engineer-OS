// =======================================================
// commandRegistry.js — Centralized Command System
// =======================================================
// Manages global commands, keyboard shortcuts, and action handlers.
// Plugins can register commands safely through the Extension SDK.
// =======================================================

import logger from "../../utils/logger.js";

const COMMAND_REGISTRY = new Map();

export const commandRegistry = {
  /**
   * Register a new command
   * @param {object} command
   */
  registerCommand: (command) => {
    if (!command || !command.id || typeof command.handler !== "function") {
      logger.warn("[CommandRegistry] Invalid command definition:", command);
      return false;
    }

    COMMAND_REGISTRY.set(command.id, {
      id: command.id,
      name: command.name || command.id,
      category: command.category || "General",
      shortcut: command.shortcut || null,
      handler: command.handler,
      pluginId: command.pluginId || "core",
    });

    logger.info(`[CommandRegistry] Registered command "${command.id}"`);
    return true;
  },

  /** Execute command by ID */
  executeCommand: (commandId, ...args) => {
    const cmd = COMMAND_REGISTRY.get(commandId);
    if (!cmd) {
      logger.warn(`[CommandRegistry] Command "${commandId}" not found.`);
      return false;
    }
    cmd.handler(...args);
    return true;
  },

  /** Get list of all registered commands */
  getCommands: () => Array.from(COMMAND_REGISTRY.values()),
};

export default commandRegistry;
