/**
 * @file issueConverter.js
 * @description Issue-to-Engineering-Task Converter for AI Engineer OS V1.6.
 * Translates GitHub issues or natural language prompts into a structured 8-part Engineering Task Object.
 */

export function convertIssueToEngineeringTask(issueOrPrompt) {
  let title = "";
  let body = "";
  let issueNumber = null;

  if (typeof issueOrPrompt === "string") {
    title = issueOrPrompt;
    body = issueOrPrompt;
  } else if (issueOrPrompt && typeof issueOrPrompt === "object") {
    title = issueOrPrompt.title || "Engineering Task";
    body = issueOrPrompt.body || issueOrPrompt.title || "";
    issueNumber = issueOrPrompt.number || null;
  }

  const isHealthEndpointTask = /health|endpoint|test/i.test(title + body);
  const isDarkModeTask = /dark mode|settings|theme/i.test(title + body);

  let affectedFiles = [];
  let problemStatement = "";
  let requirements = [];
  let acceptanceCriteria = [];
  let dependencies = [];
  let implementationPlan = [];
  let testingPlan = [];
  let riskAssessment = [];

  if (isHealthEndpointTask) {
    problemStatement = "The system requires an unauthenticated, lightweight GET /health status check endpoint on the local runtime daemon to report system health, daemon version (1.6.0), workspace path, token mask, and capabilities, accompanied by a native automated test.";
    requirements = [
      "Expose GET /health on Local Runtime Daemon (runtime/src/server.js)",
      "Return status 'ok', runtime daemon title, version '1.6.0', workspace path, tokenMask '[REDACTED]', capabilities, and timestamp",
      "Ensure route operates unauthenticated without requiring authorization headers",
      "Write automated test suite using Node built-in test runner (node --test runtime/tests/health.test.js)",
      "Verify npm run build succeeds cleanly",
    ];
    acceptanceCriteria = [
      "GET /health returns HTTP 200 OK with valid JSON response",
      "Health endpoint contains version: '1.6.0'",
      "Health response redacts sensitive tokens as '[REDACTED]'",
      "node --test runtime/tests/health.test.js passes cleanly with exit code 0",
      "npm run build finishes with 0 errors",
    ];
    affectedFiles = [
      "runtime/src/server.js",
      "runtime/tests/health.test.js",
    ];
    dependencies = ["Node.js built-in http", "Node.js built-in test module"];
    implementationPlan = [
      "1. Inspect runtime/src/server.js health endpoint route handler.",
      "2. Update version metadata to 1.6.0 and verify redacting tokenMask.",
      "3. Create runtime/tests/health.test.js using node --test.",
      "4. Execute targeted tests and full production build.",
      "5. Perform secret scanning, AI Code Review, and commit safety checklist.",
    ];
    testingPlan = [
      "Targeted Unit Test: node --test runtime/tests/health.test.js",
      "Full Build Validation: npm run build",
    ];
    riskAssessment = [
      "Low Risk: Health route is read-only and unauthenticated.",
      "No breaking changes to existing token-authenticated runtime tool routes.",
    ];
  } else if (isDarkModeTask) {
    problemStatement = "User theme preferences for Dark Mode reset upon page reloads in Settings.";
    requirements = [
      "Persist dark mode toggle state to Local Storage",
      "Apply dark class to root document element on initial load",
    ];
    acceptanceCriteria = [
      "Toggle state persists after browser refresh",
      "No visual flash of unstyled theme on page load",
    ];
    affectedFiles = ["src/pages/SettingsPage.jsx", "src/context/ThemeContext.jsx"];
    dependencies = ["React State", "LocalStorage API"];
    implementationPlan = [
      "1. Update SettingsPage state handler.",
      "2. Bind local storage sync hook.",
      "3. Run UI validation tests.",
    ];
    testingPlan = ["Validate theme persistence in UI", "Build test"];
    riskAssessment = ["Low Risk: UI local preference update"];
  } else {
    problemStatement = `Task derived from issue "${title}": ${body.substring(0, 150)}`;
    requirements = [
      `Implement feature described in: "${title}"`,
      "Inspect repository for affected source files",
      "Validate code correctness and security",
    ];
    acceptanceCriteria = [
      "All requirements satisfied",
      "Targeted tests and build pass without errors",
    ];
    affectedFiles = ["src/App.jsx"];
    dependencies = ["Project Runtime"];
    implementationPlan = [
      "1. Analyze repository components.",
      "2. Apply targeted code modifications.",
      "3. Execute test suite and verify build.",
    ];
    testingPlan = ["Execute automated test suite", "Run build validation"];
    riskAssessment = ["Medium Risk: Validate changes against working tree"];
  }

  return {
    issueNumber,
    title,
    problemStatement,
    requirements,
    acceptanceCriteria,
    affectedFiles,
    dependencies,
    implementationPlan,
    testingPlan,
    riskAssessment,
  };
}

export default convertIssueToEngineeringTask;
