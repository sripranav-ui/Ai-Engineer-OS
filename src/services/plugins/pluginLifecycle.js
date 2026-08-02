/**
 * @file pluginLifecycle.js
 * @description Plugin lifecycle state machine enums and helper transitions.
 */

export const PLUGIN_LIFECYCLE = {
  INSTALLED: "INSTALLED",
  LOADED:    "LOADED",
  ENABLED:   "ENABLED",
  DISABLED:  "DISABLED",
  UNLOADED:  "UNLOADED",
  REMOVED:   "REMOVED",
  ERROR:     "ERROR",
};

export const createPluginState = (manifest) => ({
  id: manifest.id,
  manifest,
  status: PLUGIN_LIFECYCLE.INSTALLED,
  loadedAt: null,
  error: null,
});

export default PLUGIN_LIFECYCLE;
