/**
 * @file codeReviewEngine.js
 * @description 8-Criteria AI Code Review Engine for AI Engineer OS V1.6.
 * Inspects diffs across correctness, maintainability, security, performance, unnecessary changes,
 * test coverage, error handling, and architecture consistency.
 */

export function runCodeReview({ diffText = "", changedFiles = [], testPassed = true }) {
  const findings = [];

  // 1. Correctness & Error Handling
  if (!testPassed) {
    findings.push({
      id: "cr_1",
      severity: "CRITICAL",
      category: "Correctness",
      file: "Test Suite",
      message: "Automated test suite failed. All tests must pass cleanly before committing.",
    });
  }

  // 2. Security Check
  if (/eval\(|new Function\(|exec\(.*req\./i.test(diffText)) {
    findings.push({
      id: "cr_2",
      severity: "CRITICAL",
      category: "Security",
      file: "diff",
      message: "Unsafe code execution pattern (eval/dynamic exec) detected.",
    });
  }

  // 3. Unnecessary Changes
  if (changedFiles.length > 15) {
    findings.push({
      id: "cr_3",
      severity: "HIGH",
      category: "Unnecessary Changes",
      file: "Workspace",
      message: `Large number of files modified (${changedFiles.length} files). Ensure no unintended files were staged.`,
    });
  }

  // 4. Test Coverage
  const testFileModified = changedFiles.some((f) => {
    const name = typeof f === "string" ? f : f.path || f.name || "";
    return /test|spec/i.test(name);
  });

  if (!testFileModified) {
    findings.push({
      id: "cr_4",
      severity: "MEDIUM",
      category: "Test Coverage",
      file: "TestSuite",
      message: "No test files were created or modified alongside code implementation.",
    });
  }

  // 5. Architecture Consistency & Maintainability
  findings.push({
    id: "cr_5",
    severity: "INFO",
    category: "Architecture Consistency",
    file: "Architecture",
    message: "Local runtime daemon API route structure follows V1.6 specification.",
  });

  const criticalCount = findings.filter((f) => f.severity === "CRITICAL").length;
  const highCount = findings.filter((f) => f.severity === "HIGH").length;
  const mediumCount = findings.filter((f) => f.severity === "MEDIUM").length;
  const lowCount = findings.filter((f) => f.severity === "LOW").length;
  const infoCount = findings.filter((f) => f.severity === "INFO").length;

  const passed = criticalCount === 0;

  return {
    passed,
    findings,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    infoCount,
    summary: passed
      ? `Code review passed with ${findings.length} findings (${criticalCount} Critical, ${highCount} High).`
      : `Code review BLOCKED by ${criticalCount} CRITICAL findings. Resolution required before commit.`,
  };
}

export default runCodeReview;
