/**
 * @file pluginManifestValidator.js
 * @description Manifest schema validator verifying plugin manifest definitions.
 */

export const pluginManifestValidator = {
  /**
   * Validates plugin manifest schema.
   * @param {Object} manifest
   * @returns {{ valid: boolean, errors: string[] }}
   */
  validate: (manifest) => {
    const errors = [];
    if (!manifest) return { valid: false, errors: ["Manifest object is missing."] };

    if (!manifest.id || typeof manifest.id !== "string") errors.push("Manifest requires string 'id'.");
    if (!manifest.name || typeof manifest.name !== "string") errors.push("Manifest requires string 'name'.");
    if (!manifest.version || typeof manifest.version !== "string") errors.push("Manifest requires string 'version'.");
    if (!Array.isArray(manifest.permissions)) errors.push("Manifest requires 'permissions' array.");

    return { valid: errors.length === 0, errors };
  },
};

export default pluginManifestValidator;
