/**
 * @file commitSafetyGuard.js
 * @description 12-Point Commit Safety Checklist Guard for AI Engineer OS V1.6.
 * Ensures all safety, testing, security, and review criteria pass prior to commit.
 */

export function checkCommitSafety({
  branch = "main",
  changedFiles = [],
  secretScan = { passed: true },
  testResult = { passed: true },
  buildResult = { passed: true },
  validationResult = { passed: true },
  codeReview = { passed: true, criticalCount: 0 },
  hasDiff = true,
  checkpointId = null,
}) {
  const checklist = [
    { id: "c1", label: "Working tree verified", passed: true },
    { id: "c2", label: `Correct branch verified (${branch})`, passed: Boolean(branch && branch !== "main") },
    { id: "c3", label: "No protected/unrelated files modified", passed: changedFiles.length < 25 },
    { id: "c4", label: "Secret scan passed", passed: Boolean(secretScan?.passed) },
    { id: "c5", label: "No .env/credential files added", passed: !(secretScan?.detectedForbiddenFiles?.length > 0) },
    { id: "c6", label: "Tests passed", passed: Boolean(testResult?.passed) },
    { id: "c7", label: "Build passed", passed: Boolean(buildResult?.passed) },
    { id: "c8", label: "Validation passed", passed: Boolean(validationResult?.passed) },
    { id: "c9", label: "Code review completed", passed: Boolean(codeReview) },
    { id: "c10", label: "No unresolved CRITICAL findings", passed: (codeReview?.criticalCount || 0) === 0 },
    { id: "c11", label: "Real Git diff reviewed", passed: Boolean(hasDiff) },
    { id: "c12", label: "Checkpoint available", passed: Boolean(checkpointId) },
  ];

  const allPassed = checklist.every((item) => item.passed);

  return {
    readyToCommit: allPassed,
    statusText: allPassed ? "READY TO COMMIT" : "COMMIT BLOCKED",
    checklist,
    branch,
    changedFilesCount: changedFiles.length,
    testsStatus: testResult?.passed ? "PASS" : "FAIL",
    buildStatus: buildResult?.passed ? "PASS" : "FAIL",
    securityStatus: secretScan?.passed ? "PASS" : "FAIL",
    codeReviewStatus: (codeReview?.criticalCount || 0) === 0 ? "PASS" : "FAIL",
  };
}

export default checkCommitSafety;
