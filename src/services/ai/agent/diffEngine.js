/**
 * @file diffEngine.js
 * @description Diff Engine for AI Agent Execution Pipeline.
 * Generates structured diffs (added, removed, modified lines) with before/after previews.
 * Never overwrites files blindly — all changes are expressed as deltas.
 */

class DiffEngine {
  /**
   * Generate a structured diff between two strings
   * @param {string} before - Original content
   * @param {string} after - Modified content
   * @param {string} [filePath] - File path for context
   * @returns {{ filePath: string, added: Array, removed: Array, modified: Array, summary: string, hunks: Array }}
   */
  generateDiff(before = "", after = "", filePath = "unknown") {
    const beforeLines = before.split("\n");
    const afterLines = after.split("\n");

    const added = [];
    const removed = [];
    const modified = [];
    const hunks = [];

    const maxLen = Math.max(beforeLines.length, afterLines.length);

    for (let i = 0; i < maxLen; i++) {
      const bLine = i < beforeLines.length ? beforeLines[i] : undefined;
      const aLine = i < afterLines.length ? afterLines[i] : undefined;

      if (bLine === undefined && aLine !== undefined) {
        added.push({ line: i + 1, content: aLine });
        hunks.push({ type: "add", line: i + 1, content: aLine });
      } else if (bLine !== undefined && aLine === undefined) {
        removed.push({ line: i + 1, content: bLine });
        hunks.push({ type: "remove", line: i + 1, content: bLine });
      } else if (bLine !== aLine) {
        modified.push({ line: i + 1, before: bLine, after: aLine });
        hunks.push({ type: "modify", line: i + 1, before: bLine, after: aLine });
      }
    }

    const totalChanges = added.length + removed.length + modified.length;

    return {
      filePath,
      added,
      removed,
      modified,
      hunks,
      summary: `${filePath}: +${added.length} -${removed.length} ~${modified.length} (${totalChanges} total changes)`,
      hasChanges: totalChanges > 0,
    };
  }

  /**
   * Generate a unified diff string (git-style format)
   * @param {string} before
   * @param {string} after
   * @param {string} filePath
   * @returns {string}
   */
  generateUnifiedDiff(before = "", after = "", filePath = "unknown") {
    const diff = this.generateDiff(before, after, filePath);
    const lines = [`--- a/${filePath}`, `+++ b/${filePath}`];

    for (const hunk of diff.hunks) {
      if (hunk.type === "add") {
        lines.push(`+${hunk.content}`);
      } else if (hunk.type === "remove") {
        lines.push(`-${hunk.content}`);
      } else if (hunk.type === "modify") {
        lines.push(`-${hunk.before}`);
        lines.push(`+${hunk.after}`);
      }
    }

    return lines.join("\n");
  }

  /**
   * Apply a diff to original content
   * @param {string} original - Original file content
   * @param {Array<{ type: string, line: number, content?: string, before?: string, after?: string }>} hunks
   * @returns {string} Modified content
   */
  applyDiff(original = "", hunks = []) {
    const lines = original.split("\n");

    // Process hunks in reverse order to preserve line numbers
    const sortedHunks = [...hunks].sort((a, b) => b.line - a.line);

    for (const hunk of sortedHunks) {
      const idx = hunk.line - 1;
      if (hunk.type === "add") {
        lines.splice(idx, 0, hunk.content);
      } else if (hunk.type === "remove") {
        lines.splice(idx, 1);
      } else if (hunk.type === "modify") {
        lines[idx] = hunk.after;
      }
    }

    return lines.join("\n");
  }

  /**
   * Generate a human-readable diff preview for the UI
   * @param {Object} diffResult - Result from generateDiff
   * @returns {string}
   */
  formatPreview(diffResult) {
    if (!diffResult || !diffResult.hasChanges) return "No changes detected.";

    const lines = [`### ${diffResult.filePath}`, ""];

    if (diffResult.added.length > 0) {
      lines.push(`**Added** (${diffResult.added.length} lines):`);
      diffResult.added.slice(0, 10).forEach((a) => {
        lines.push(`  + Line ${a.line}: \`${a.content}\``);
      });
    }

    if (diffResult.removed.length > 0) {
      lines.push(`**Removed** (${diffResult.removed.length} lines):`);
      diffResult.removed.slice(0, 10).forEach((r) => {
        lines.push(`  - Line ${r.line}: \`${r.content}\``);
      });
    }

    if (diffResult.modified.length > 0) {
      lines.push(`**Modified** (${diffResult.modified.length} lines):`);
      diffResult.modified.slice(0, 10).forEach((m) => {
        lines.push(`  ~ Line ${m.line}:`);
        lines.push(`    Before: \`${m.before}\``);
        lines.push(`    After:  \`${m.after}\``);
      });
    }

    return lines.join("\n");
  }
}

export const diffEngine = new DiffEngine();
export default diffEngine;
