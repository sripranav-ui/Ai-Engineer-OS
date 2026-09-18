/**
 * @file issueTaskConverter.js
 * @description Pure Issue-to-Engineering-Task Conversion Layer for AI Engineer OS.
 * Transforms normalized GitHub issue data into a structured, deterministic EngineeringTask object.
 * Pure function: ZERO network calls, ZERO PAT credentials, ZERO runtime/filesystem dependencies.
 * Treats all issue text strictly as untrusted data.
 */

import { RUNTIME_ERROR_CODES, createRuntimeError } from "../runtime/runtimeErrors.js";
import { redactSecrets } from "../runtime/runtimeProtocol.js";

/**
 * Pure, deterministic string hash function for stable task IDs
 * @param {string} str
 * @returns {string} 8-character hex hash
 */
function simpleHash(str = "") {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/**
 * Conservatively extract explicit acceptance criteria lines from issue body
 * @param {string} body
 * @returns {Array<string>}
 */
function extractAcceptanceCriteria(body = "") {
  if (typeof body !== "string" || !body.trim()) return [];

  const lines = body.split("\n");
  const criteria = [];
  let inCriteriaBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Detect explicit section header
    if (/^#+\s*acceptance\s*criteria/i.test(trimmed) || /^acceptance\s*criteria:/i.test(trimmed)) {
      inCriteriaBlock = true;
      continue;
    }

    // Detect another section header ending criteria block
    if (inCriteriaBlock && /^#+\s+[a-zA-Z]/i.test(trimmed)) {
      inCriteriaBlock = false;
    }

    // Extract list items or markdown checkboxes
    if (inCriteriaBlock && /^(?:-\s*\[[ xX]\]|-\s*|\*\s*|\d+\.\s*)(.+)/.test(trimmed)) {
      const match = trimmed.match(/^(?:-\s*\[[ xX]\]|-\s*|\*\s*|\d+\.\s*)(.+)/);
      if (match && match[1]) {
        criteria.push(redactSecrets(match[1].trim()));
      }
    } else if (!inCriteriaBlock && /^-\s*\[[ xX]\]\s*(.+)/.test(trimmed)) {
      // Standalone markdown checkboxes
      const match = trimmed.match(/^-\s*\[[ xX]\]\s*(.+)/);
      if (match && match[1]) {
        criteria.push(redactSecrets(match[1].trim()));
      }
    }
  }

  return criteria;
}

/**
 * Determine priority conservatively from GitHub labels
 * @param {Array} labels
 * @returns {string|null}
 */
function determinePriority(labels = []) {
  if (!Array.isArray(labels)) return null;

  for (const label of labels) {
    const name = typeof label === "object" ? String(label.name || "").toLowerCase() : String(label).toLowerCase();
    if (name.includes("critical") || name.includes("p0") || name.includes("urgent")) return "critical";
    if (name.includes("high") || name.includes("p1")) return "high";
    if (name.includes("medium") || name.includes("p2")) return "medium";
    if (name.includes("low") || name.includes("p3")) return "low";
  }

  return null;
}

/**
 * Pure conversion function transforming GitHub issue to EngineeringTask
 * @param {Object} issue - Normalized GitHub issue object from Step 5.4
 * @param {Object} [context] - Optional repository context { owner, repo, fullName, defaultBranch }
 * @returns {Object} Structured EngineeringTask object
 */
export function convertIssueToEngineeringTask(issue, context = {}) {
  if (!issue || typeof issue !== "object") {
    throw createRuntimeError(
      RUNTIME_ERROR_CODES.INVALID_REQUEST,
      "Invalid GitHub issue payload: Input must be a non-null object",
      "issueTaskConverter.convert"
    );
  }

  if (!issue.title || typeof issue.title !== "string" || !issue.title.trim()) {
    throw createRuntimeError(
      RUNTIME_ERROR_CODES.INVALID_REQUEST,
      "Invalid GitHub issue payload: Issue must contain a valid non-empty string 'title'",
      "issueTaskConverter.convert"
    );
  }

  const rawTitle = issue.title.trim();
  const title = redactSecrets(rawTitle.length > 250 ? rawTitle.substring(0, 250) : rawTitle);
  const description = redactSecrets(typeof issue.body === "string" ? issue.body.trim() : "");
  const issueNumber = typeof issue.number === "number" || typeof issue.number === "string" ? issue.number : null;

  // Repository Context Normalization
  const owner = context?.owner || null;
  const repo = context?.repo || null;
  const fullName = context?.fullName || (owner && repo ? `${owner}/${repo}` : null);

  // Labels Normalization
  const rawLabels = Array.isArray(issue.labels) ? issue.labels : [];
  const labels = rawLabels.map((l) => ({
    name: redactSecrets(typeof l === "object" ? String(l.name || "") : String(l)),
  }));

  const priority = determinePriority(rawLabels);
  const acceptanceCriteria = extractAcceptanceCriteria(description);

  // Stable Deterministic Task ID
  const hashKey = `${issueNumber || "custom"}_${title}`;
  const taskId = `task_gh_${issueNumber || "ext"}_${simpleHash(hashKey)}`;

  return {
    taskId,
    source: {
      provider: "github",
      type: "issue",
      issueNumber,
      repository: {
        owner,
        repo,
        fullName,
      },
      url: issue.htmlUrl || null,
    },
    title,
    description,
    priority,
    labels,
    acceptanceCriteria,
    requirements: [
      `Implement feature described in GitHub Issue #${issueNumber || "N/A"}: "${title}"`,
      "Satisfy all explicit acceptance criteria and verify regression tests",
    ],
    metadata: {
      author: redactSecrets(issue.author || issue.user?.login || "unknown"),
      state: issue.state || "open",
      createdAt: issue.createdAt || "",
      updatedAt: issue.updatedAt || "",
    },
  };
}

export default convertIssueToEngineeringTask;
