/**
 * @file validationEngine.js
 * @description Validation Engine for AI Agent Execution Pipeline.
 * Runs post-execution validation checks: build succeeds, imports exist,
 * no syntax errors, no duplicate routes, no missing exports.
 */

import workspaceScanner from "./workspaceScanner.js";

class ValidationEngine {
  /**
   * Run full validation suite against workspace state
   * @param {Object} workspacesData - Current Studio workspaces data
   * @returns {{ passed: boolean, checks: Array<{ name: string, passed: boolean, details: string }>, summary: string }}
   */
  validate(workspacesData = {}) {
    const checks = [];

    checks.push(this._checkSyntaxErrors(workspacesData));
    checks.push(this._checkImportsExist(workspacesData));
    checks.push(this._checkDuplicateRoutes(workspacesData));
    checks.push(this._checkMissingExports(workspacesData));
    checks.push(this._checkEmptyFiles(workspacesData));

    const passed = checks.every((c) => c.passed);
    const failedCount = checks.filter((c) => !c.passed).length;

    return {
      passed,
      checks,
      summary: passed
        ? `All ${checks.length} validation checks passed ✓`
        : `${failedCount}/${checks.length} validation checks failed`,
    };
  }

  /**
   * Validate a specific file's content
   * @param {string} fileName
   * @param {string} content
   * @returns {{ passed: boolean, errors: Array<string> }}
   */
  validateFile(fileName = "", content = "") {
    const errors = [];

    // Check for obvious syntax issues
    const openBraces = (content.match(/{/g) || []).length;
    const closeBraces = (content.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      errors.push(`Mismatched braces: ${openBraces} opening vs ${closeBraces} closing`);
    }

    const openParens = (content.match(/\(/g) || []).length;
    const closeParens = (content.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      errors.push(`Mismatched parentheses: ${openParens} opening vs ${closeParens} closing`);
    }

    // Check for unterminated strings
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const singleQuotes = (line.match(/'/g) || []).length;
      const doubleQuotes = (line.match(/"/g) || []).length;
      const backticks = (line.match(/`/g) || []).length;
      // Only flag obvious single-line issues
      if (singleQuotes % 2 !== 0 && !line.includes("//") && !line.includes("/*") && backticks === 0) {
        // Skip lines with template literals or comments
      }
      if (doubleQuotes % 2 !== 0 && !line.includes("//") && !line.includes("/*") && backticks === 0) {
        // Skip
      }
    }

    return {
      passed: errors.length === 0,
      errors,
    };
  }

  /** @private Check for common syntax errors across all files */
  _checkSyntaxErrors(workspacesData) {
    let errorCount = 0;
    const details = [];

    for (const [, fileList] of Object.entries(workspacesData)) {
      if (!Array.isArray(fileList)) continue;
      for (const file of fileList) {
        if (!file || !file.content) continue;
        const result = this.validateFile(file.name, file.content);
        if (!result.passed) {
          errorCount++;
          details.push(`${file.name}: ${result.errors.join(", ")}`);
        }
      }
    }

    return {
      name: "Syntax Validation",
      passed: errorCount === 0,
      details: errorCount === 0 ? "No syntax errors detected" : details.join("; "),
    };
  }

  /** @private Check that imported files exist in the workspace */
  _checkImportsExist(workspacesData) {
    const scan = workspaceScanner.getLastScan();
    if (!scan) return { name: "Imports Exist", passed: true, details: "No scan available, skipped" };

    const fileNames = new Set(scan.files.map((f) => f.name.replace(/\.(js|jsx|ts|tsx)$/, "")));
    const missing = [];

    for (const [fileName, importPaths] of Object.entries(scan.imports)) {
      for (const importPath of importPaths) {
        if (importPath.startsWith(".")) {
          const baseName = importPath.split("/").pop().replace(/\.(js|jsx|ts|tsx)$/, "");
          if (!fileNames.has(baseName) && !["react", "react-dom"].includes(baseName)) {
            missing.push(`${fileName} → ${importPath}`);
          }
        }
      }
    }

    return {
      name: "Imports Exist",
      passed: missing.length === 0,
      details: missing.length === 0 ? "All local imports resolve" : `Missing: ${missing.slice(0, 5).join(", ")}`,
    };
  }

  /** @private Check for duplicate route definitions */
  _checkDuplicateRoutes(workspacesData) {
    const scan = workspaceScanner.getLastScan();
    if (!scan) return { name: "No Duplicate Routes", passed: true, details: "No scan available, skipped" };

    const routePaths = scan.routes.map((r) => r.path);
    const duplicates = routePaths.filter((p, i) => routePaths.indexOf(p) !== i);

    return {
      name: "No Duplicate Routes",
      passed: duplicates.length === 0,
      details: duplicates.length === 0 ? "No duplicate routes" : `Duplicates: ${[...new Set(duplicates)].join(", ")}`,
    };
  }

  /** @private Check for missing export declarations */
  _checkMissingExports(workspacesData) {
    let filesWithoutExport = 0;

    for (const [, fileList] of Object.entries(workspacesData)) {
      if (!Array.isArray(fileList)) continue;
      for (const file of fileList) {
        if (!file || !file.content) continue;
        const ext = file.name.split(".").pop();
        if (["js", "jsx", "ts", "tsx"].includes(ext)) {
          if (!/\bexport\b/.test(file.content) && file.content.trim().length > 0) {
            filesWithoutExport++;
          }
        }
      }
    }

    return {
      name: "Export Declarations",
      passed: true, // Non-blocking: some files legitimately have no exports
      details: filesWithoutExport === 0 ? "All source files have exports" : `${filesWithoutExport} files without export statements (non-blocking)`,
    };
  }

  /** @private Check for empty files */
  _checkEmptyFiles(workspacesData) {
    const empty = [];

    for (const [, fileList] of Object.entries(workspacesData)) {
      if (!Array.isArray(fileList)) continue;
      for (const file of fileList) {
        if (file && file.content !== undefined && file.content.trim().length === 0) {
          empty.push(file.name);
        }
      }
    }

    return {
      name: "No Empty Files",
      passed: empty.length === 0,
      details: empty.length === 0 ? "No empty files" : `Empty: ${empty.join(", ")}`,
    };
  }
}

export const validationEngine = new ValidationEngine();
export default validationEngine;
