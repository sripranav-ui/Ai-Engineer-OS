// =======================================================
// eventBus.js — Decoupled Event System Engine
// =======================================================
// Application-wide publish/subscribe event bus allowing plugins
// and core modules to communicate without direct coupling.
// =======================================================

import logger from "../../utils/logger.js";

const listenersMap = new Map();

export const eventBus = {
  /**
   * Subscribe to an event
   * @param {string} eventName - event name (e.g. "ProjectCreated")
   * @param {function} listener - callback function
   * @returns {function} unsubscribe handle
   */
  subscribe: (eventName, listener) => {
    if (!listenersMap.has(eventName)) {
      listenersMap.set(eventName, new Set());
    }
    listenersMap.get(eventName).add(listener);

    // Return unsubscribe callback
    return () => {
      const set = listenersMap.get(eventName);
      if (set) {
        set.delete(listener);
      }
    };
  },

  /**
   * Publish an event to all subscribers
   * @param {string} eventName
   * @param {object} payload
   */
  publish: (eventName, payload = {}) => {
    const listeners = listenersMap.get(eventName);
    if (!listeners || listeners.size === 0) return;

    logger.info(`[EventBus] Publishing event "${eventName}" to ${listeners.size} subscriber(s).`);
    listeners.forEach((listener) => {
      try {
        listener(payload);
      } catch (err) {
        logger.error(`[EventBus] Listener error on event "${eventName}":`, err);
      }
    });
  },

  /** Clear all event listeners */
  clearAll: () => {
    listenersMap.clear();
  },
};

// Aliases for event emitter interface compatibility
eventBus.on = eventBus.subscribe;
eventBus.emit = eventBus.publish;

export default eventBus;
