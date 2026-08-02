/**
 * Predefined Enterprise AI Prompt Templates
 */
const TEMPLATES = {
  codeOptimize: "Optimize the following {language} code for execution speed and memory allocations:\n\n{code}",
  codeDebug: "Identify syntax errors and execution bugs in this {language} snippet:\n\n{code}",
  starInterview: "You are the Senior Tech Recruiter. Grade the candidate's answer below using STAR method criteria:\nQuestion: {question}\nResponse: {answer}"
};

/**
 * System and Variable Prompt Injection Service
 */
export const promptService = {
  /**
   * Translates keys templates replacing placeholder keys brackets
   */
  compile: (templateId, variables = {}) => {
    let tpl = TEMPLATES[templateId];
    if (!tpl) return "";

    Object.keys(variables).forEach((key) => {
      tpl = tpl.replace(new RegExp(`{${key}}`, "g"), variables[key]);
    });
    return tpl;
  },

  /**
   * Registers a brand new custom template
   */
  registerTemplate: (templateId, templateText) => {
    TEMPLATES[templateId] = templateText;
  }
};

export default promptService;
