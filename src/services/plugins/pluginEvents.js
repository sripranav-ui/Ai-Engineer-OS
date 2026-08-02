/**
 * @file pluginEvents.js
 * @description Plugin Event Bridge connecting plugin subscriptions to eventBus.
 */

import eventBus from "./eventBus.js";
import logger from "../../utils/logger.js";

export const pluginEvents = {
  /**
   * Subscribes a plugin listener function to an event.
   * @param {string} pluginId
   * @param {string} event
   * @param {Function} callback
   */
  subscribe: (pluginId, event, callback) => {
    logger.info(`[PluginEvents] Plugin "${pluginId}" subscribed to event "${event}".`);
    return eventBus.subscribe(event, (payload) => {
      try {
        callback(payload);
      } catch (err) {
        logger.error(`[PluginEvents] Error in event listener for plugin "${pluginId}":`, err);
      }
    });
  },
};

export default pluginEvents;
