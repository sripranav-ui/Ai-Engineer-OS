// =======================================================
// argumentValidator.js — Tool Argument Schema Validator
// =======================================================

export const argumentValidator = {
  /**
   * Validate tool argument dictionary against tool requirements
   * @param {object} tool
   * @param {object} args
   */
  validate: (tool, args = {}) => {
    if (typeof tool.validateArgs === "function") {
      return tool.validateArgs(args);
    }
    return { valid: true, errors: [] };
  },

  /** Assert argument validity */
  assertValid: (tool, args) => {
    const result = argumentValidator.validate(tool, args);
    if (!result.valid) {
      throw new Error(`Argument Error for tool "${tool.id}": ${result.errors.join(", ")}`);
    }
  },
};

export default argumentValidator;
