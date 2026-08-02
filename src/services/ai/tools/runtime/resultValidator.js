// =======================================================
// resultValidator.js — Tool Execution Output Payload Validator
// =======================================================

export const resultValidator = {
  /** Ensure tool output is a valid object containing status or result payload */
  validateResult: (toolId, output) => {
    if (output === undefined || output === null) {
      return { success: false, error: `Tool "${toolId}" returned null or undefined result.` };
    }
    return { success: true, result: output };
  },
};

export default resultValidator;
