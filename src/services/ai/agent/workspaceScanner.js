/**
 * @file workspaceScanner.js
 * @description Workspace Scanner for AI Agent Execution Pipeline.
 * Inspects project structure, collects folders, files, imports, exports,
 * routes, components, hooks, services, dependencies, and build configuration.
 */

const SCAN_STORAGE_KEY = "ai_workspace_scan_v1";

const REGEXP_COMPONENT = /\bexport\s+(default\s+)?function\s+[A-Z]|\bconst\s+[A-Z]\w+\s*=/;
const REGEXP_HOOK = /\bfunction\s+use[A-Z]|\bconst\s+use[A-Z]\w+\s*=/;
const REGEXP_SERVICE = /\bclass\s+\w+Service/;
const REGEXP_SERVICE_FILE = /Service\b/;
const REGEXP_ROUTE = /\bRoute\b|\bpath\s*[:=]/;
const REGEXP_IMPORT_FROM = /from\s+['"]([^'"]+)['"]/;
const REGEXP_EXPORT_PREFIX = /export\s+(default\s+)?/;
const REGEXP_ROUTE_PATH_EXTRACT = /['"]([^'"]+)['"]/;

class WorkspaceScanner {
  constructor() {
    this.lastScan = this._load();
  }

  /**
   * Scan workspace files stored in Studio workspace data
   * @param {Object} workspacesData - Studio workspaces data ({ python: [...], web: [...] })
   * @returns {{ folders: Array, files: Array, components: Array, hooks: Array, services: Array, routes: Array, imports: Object, exports: Object, dependencies: Object, buildConfig: Object }}
   */
  scan(workspacesData = {}) {
    const folders = new Set();
    const files = [];
    const components = [];
    const hooks = [];
    const services = [];
    const routes = [];
    const imports = {};
    const exports = {};

    for (const [workspace, fileList] of Object.entries(workspacesData)) {
      if (!Array.isArray(fileList)) continue;

      folders.add(workspace);

      for (const file of fileList) {
        if (!file || !file.name) continue;

        const fileName = file.name;
        const content = file.content || "";
        const ext = fileName.split(".").pop().toLowerCase();

        files.push({
          name: fileName,
          workspace,
          extension: ext,
          size: content.length,
          lines: content.split("\n").length,
        });

        // Detect components (React)
        if (REGEXP_COMPONENT.test(content)) {
          components.push({ name: fileName, workspace });
        }

        // Detect hooks
        if (REGEXP_HOOK.test(content)) {
          hooks.push({ name: fileName, workspace });
        }

        // Detect services
        if (REGEXP_SERVICE.test(content) || REGEXP_SERVICE_FILE.test(fileName)) {
          services.push({ name: fileName, workspace });
        }

        // Extract imports
        const importMatches = content.match(/import\s+.*?from\s+['"][^'"]+['"]/g) || [];
        if (importMatches.length > 0) {
          imports[fileName] = importMatches.map((m) => {
            const fromMatch = m.match(REGEXP_IMPORT_FROM);
            return fromMatch ? fromMatch[1] : m;
          });
        }

        // Extract exports
        const exportMatches = content.match(/export\s+(default\s+)?(function|class|const|let|var)\s+(\w+)/g) || [];
        if (exportMatches.length > 0) {
          exports[fileName] = exportMatches.map((m) => m.replace(REGEXP_EXPORT_PREFIX, "").trim());
        }

        // Detect routes
        if (REGEXP_ROUTE.test(content)) {
          const routeMatches = content.match(/path\s*[:=]\s*['"]([^'"]+)['"]/g) || [];
          routeMatches.forEach((r) => {
            const pathMatch = r.match(REGEXP_ROUTE_PATH_EXTRACT);
            if (pathMatch) routes.push({ path: pathMatch[1], file: fileName, workspace });
          });
        }
      }
    }

    // Detect package.json and build config from Studio data
    const dependencies = {};
    const buildConfig = {};

    const scanResult = {
      timestamp: Date.now(),
      folders: Array.from(folders),
      files,
      components,
      hooks,
      services,
      routes,
      imports,
      exports,
      dependencies,
      buildConfig,
      summary: {
        totalFiles: files.length,
        totalFolders: folders.size,
        totalComponents: components.length,
        totalHooks: hooks.length,
        totalServices: services.length,
        totalRoutes: routes.length,
      },
    };

    this.lastScan = scanResult;
    this._save();
    return scanResult;
  }

  /**
   * Get last scan result
   * @returns {Object|null}
   */
  getLastScan() {
    return this.lastScan;
  }

  /**
   * Find files matching a pattern
   * @param {string} pattern - Search term
   * @returns {Array<{ name: string, workspace: string }>}
   */
  findFiles(pattern = "") {
    if (!this.lastScan || !this.lastScan.files) return [];
    const lowerPattern = pattern.toLowerCase();
    return this.lastScan.files.filter((f) => f.name.toLowerCase().includes(lowerPattern));
  }

  /**
   * Get file summary for orchestrator context injection
   * @returns {string}
   */
  getProjectSummary() {
    if (!this.lastScan) return "No workspace scan available.";
    const s = this.lastScan.summary;
    return [
      `Project Structure: ${s.totalFiles} files across ${s.totalFolders} workspaces`,
      `Components: ${s.totalComponents} | Hooks: ${s.totalHooks} | Services: ${s.totalServices}`,
      `Routes: ${s.totalRoutes}`,
      `Files: ${this.lastScan.files.map((f) => f.name).join(", ")}`,
    ].join("\n");
  }

  /** @private */
  _load() {
    try {
      const raw = localStorage.getItem(SCAN_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /** @private */
  _save() {
    try {
      localStorage.setItem(SCAN_STORAGE_KEY, JSON.stringify(this.lastScan));
    } catch {
      // Silently fail
    }
  }
}

export const workspaceScanner = new WorkspaceScanner();
export default workspaceScanner;
