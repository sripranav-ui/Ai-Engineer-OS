/**
 * @file projectIndexer.js
 * @description Project Indexer for AI Agent Execution Pipeline.
 * Creates a searchable project graph from workspace scan data.
 * Analyzes component hierarchy, dependency graph, unused files, dead imports, and shared utilities.
 */

import workspaceScanner from "./workspaceScanner.js";

class ProjectIndexer {
  constructor() {
    this.index = null;
  }

  /**
   * Build project index from workspace scan results
   * @param {Object} [scanResult] - Optional scan result override
   * @returns {Object} Project index
   */
  buildIndex(scanResult = null) {
    const scan = scanResult || workspaceScanner.getLastScan();
    if (!scan) {
      return { error: "No workspace scan available. Run workspaceScanner.scan() first." };
    }

    const dependencyGraph = this._buildDependencyGraph(scan);
    const componentHierarchy = this._buildComponentHierarchy(scan);
    const unusedFiles = this._findUnusedFiles(scan);
    const deadImports = this._findDeadImports(scan);
    const sharedUtilities = this._findSharedUtilities(scan);

    this.index = {
      timestamp: Date.now(),
      scanTimestamp: scan.timestamp,
      dependencyGraph,
      componentHierarchy,
      unusedFiles,
      deadImports,
      sharedUtilities,
      fileCount: scan.files.length,
    };

    return this.index;
  }

  /**
   * Search project index for files, components, or symbols matching a query
   * @param {string} query
   * @returns {Array<{ type: string, name: string, workspace?: string, context?: string }>}
   */
  search(query = "") {
    const scan = workspaceScanner.getLastScan();
    if (!scan) return [];

    const lower = query.toLowerCase();
    const results = [];

    // Search files
    for (const file of scan.files) {
      if (file.name.toLowerCase().includes(lower)) {
        results.push({ type: "file", name: file.name, workspace: file.workspace });
      }
    }

    // Search components
    for (const comp of scan.components) {
      if (comp.name.toLowerCase().includes(lower)) {
        results.push({ type: "component", name: comp.name, workspace: comp.workspace });
      }
    }

    // Search exports
    for (const [fileName, exportNames] of Object.entries(scan.exports)) {
      for (const expName of exportNames) {
        if (expName.toLowerCase().includes(lower)) {
          results.push({ type: "export", name: expName, context: fileName });
        }
      }
    }

    // Search routes
    for (const route of scan.routes) {
      if (route.path.toLowerCase().includes(lower)) {
        results.push({ type: "route", name: route.path, context: route.file });
      }
    }

    return results;
  }

  /**
   * Get formatted project context string for LLM system prompts
   * @returns {string}
   */
  getProjectContext() {
    if (!this.index) this.buildIndex();
    if (!this.index || this.index.error) return "Project index unavailable.";

    const lines = [
      `Project Index (${this.index.fileCount} files):`,
      `Component Hierarchy: ${this.index.componentHierarchy.length} components`,
      `Dependency Edges: ${this.index.dependencyGraph.length} connections`,
      `Unused Files: ${this.index.unusedFiles.length}`,
      `Dead Imports: ${this.index.deadImports.length}`,
      `Shared Utilities: ${this.index.sharedUtilities.length}`,
    ];
    return lines.join("\n");
  }

  /** @private Build dependency graph edges */
  _buildDependencyGraph(scan) {
    const edges = [];
    for (const [fileName, importPaths] of Object.entries(scan.imports)) {
      for (const importPath of importPaths) {
        edges.push({ from: fileName, to: importPath });
      }
    }
    return edges;
  }

  /** @private Build component hierarchy */
  _buildComponentHierarchy(scan) {
    return scan.components.map((comp) => ({
      name: comp.name,
      workspace: comp.workspace,
      imports: scan.imports[comp.name] || [],
      exports: scan.exports[comp.name] || [],
    }));
  }

  /** @private Find files that are never imported by other files */
  _findUnusedFiles(scan) {
    const allImportTargets = new Set();
    for (const importPaths of Object.values(scan.imports)) {
      for (const p of importPaths) {
        const baseName = p.split("/").pop().replace(/\.(js|jsx|ts|tsx|css)$/, "");
        allImportTargets.add(baseName);
      }
    }

    return scan.files
      .filter((f) => {
        const base = f.name.replace(/\.(js|jsx|ts|tsx|css)$/, "");
        return !allImportTargets.has(base) && !["index", "App", "main"].includes(base);
      })
      .map((f) => f.name);
  }

  /** @private Find imports that point to non-existent local files */
  _findDeadImports(scan) {
    const fileNames = new Set(scan.files.map((f) => f.name.replace(/\.(js|jsx|ts|tsx|css)$/, "")));
    const dead = [];

    for (const [fileName, importPaths] of Object.entries(scan.imports)) {
      for (const importPath of importPaths) {
        if (importPath.startsWith(".")) {
          const baseName = importPath.split("/").pop().replace(/\.(js|jsx|ts|tsx|css)$/, "");
          if (!fileNames.has(baseName)) {
            dead.push({ file: fileName, import: importPath });
          }
        }
      }
    }
    return dead;
  }

  /** @private Find files imported by 3+ other files (shared utilities) */
  _findSharedUtilities(scan) {
    const importCounts = {};
    for (const importPaths of Object.values(scan.imports)) {
      for (const p of importPaths) {
        const baseName = p.split("/").pop().replace(/\.(js|jsx|ts|tsx|css)$/, "");
        importCounts[baseName] = (importCounts[baseName] || 0) + 1;
      }
    }

    return Object.entries(importCounts)
      .filter(([, count]) => count >= 3)
      .map(([name, count]) => ({ name, importedBy: count }))
      .sort((a, b) => b.importedBy - a.importedBy);
  }
}

export const projectIndexer = new ProjectIndexer();
export default projectIndexer;
