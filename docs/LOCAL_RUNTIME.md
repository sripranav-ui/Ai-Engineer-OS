# 🚀 AI ENGINEER OS V1.4 — NATIVE LOCAL RUNTIME DAEMON

## 📌 Overview

AI Engineer OS V1.4 introduces a standalone, zero-dependency **Node.js Local Runtime Daemon** (`runtime/src/index.js`) that runs natively on host operating systems (Windows, macOS, Linux). 

The Local Runtime Daemon provides genuine host OS execution for:
- Native filesystem read/write/delete/list operations
- Host CLI terminal execution (`child_process.exec`)
- Host Git repository queries (`git status`, `git diff`, `git log`)
- Automated test and build runners (`npm test`, `npm run build`)
- Dynamic capability probing (`node --version`, `git --version`, `npm --version`)

```text
Browser UI (AI Engineer OS)
       ↓
  runtimeClient.js (HTTP Client)
       ↓
 HTTP / REST API (http://127.0.0.1:7070)
       ↓
 Session Token Authentication (Authorization: Bearer <token>)
       ↓
 Workspace Guard & Command Policy (d:\coding\AI-Engineer-OS)
       ↓
 Native Node.js Process & Host Windows OS
```

---

## 🚀 Starting the Local Runtime Daemon

To start the daemon manually on your host machine:

```bash
# Navigate to runtime directory
cd runtime

# Start runtime daemon
node src/index.js
```

Or from the root directory:

```bash
node runtime/src/index.js
```

### Daemon Output Stream:
```text
=======================================================
🚀 AI ENGINEER OS LOCAL RUNTIME DAEMON (V1.4.0)
📡 Listening on: http://127.0.0.1:7070
📁 Active Workspace: D:\coding\AI-Engineer-OS
🔑 Session Token: runtime_tok_4e102edf4917351fe7c4d1c47fde2f09
=======================================================
```

---

## 🔒 Security & Authentication Architecture

### 1. Localhost Binding & Token Authentication
- The daemon binds strictly to `127.0.0.1:7070` (localhost) and rejects non-local CORS origins.
- Generates a cryptographically random session token (`runtime_tok_...`) at startup.
- All REST endpoints (except `GET /health`) require `Authorization: Bearer <token>` or `x-runtime-token`.

### 2. Workspace Isolation & Path Traversal Guards
- All file operations are canonicalized against `workspacePath` using Node's `path.resolve`.
- Path traversal sequences (`../`, `..\`) are intercepted and rejected automatically.

### 3. Command Classification Policy
- **`SAFE`**: `node --version`, `git status`, `git diff`, `git log`, `npm test`, `npm run build`. Executed automatically.
- **`APPROVAL_REQUIRED`**: `npm install`, `git commit`, `git push`, `docker run`. Require user confirmation.
- **`BLOCKED`**: `rm -rf /`, `rmdir /s`, `format`, `shutdown`, `git reset --hard`, `sudo su`, `curl | sh`. Intercepted with Exit Code 126.

---

## 🌐 Browser Fallback vs Local Runtime Mode

| Feature | Local Runtime Mode (Connected) | Browser Mode (Offline) |
| :--- | :--- | :--- |
| **Execution Engine** | Native Windows OS via `127.0.0.1:7070` | In-browser JS & Studio Terminal Overlay |
| **Filesystem Writes** | Modifies physical disk files (`D:\coding\...`) | Updates active React editor state & IndexedDB |
| **Git Integration** | Involves physical `git.exe` binary | Returns structured mock deltas |
| **CLI Execution** | Runs host `child_process.exec` | Dispatches via EventBus to UI terminal overlay |
| **Status Badge** | `● Local Runtime Connected` | `○ Browser Mode` |
