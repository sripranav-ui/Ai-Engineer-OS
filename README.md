# AI Engineer OS - Enterprise Developer Portal

**AI Engineer OS** is an enterprise-grade, premium SaaS developer workspace and training platform. It integrates active curriculum trackers, browser-simulated coding sandboxes, collaborative study hubs, AI career diagnosers, and mock interviewer checkpoints into a unified Dracula/Cyberpunk/Light-themed layout.

---

## 🚀 Key Features and Modules

- **💻 AI Coding Sandbox**: A simulated browser-IDE containing Jupyter notebooks, stages commit trackers, snippet managers, and interactive command terminals.
- **🌐 Collaborative Community Hub**: Integrates channel messaging feeds, posts discussion threads, question upvoting grids, hackathons, and mentor calendar slots.
- **👨‍🏫 AI Career Coach & STAR Chatbot**: Evaluates candidate transcripts using STAR behavioral parameters, analyses skill gaps, and projects career timelines.
- **📅 Planner & Curriculum Academies**: Organizes task schedules and curriculum stage checkpoints.
- **⚙️ Preferences Console**: Supports swapping themes (Dracula, Cyberpunk, Light) and primary color variables globally.

---

## 📂 Project Architecture and Directory Structure

The project has been refactored to align with enterprise design standards:

```text
src/
├── components/
│   ├── Common/        # Reusable UI Component Library (Buttons, Drawers, Accordions, Toasts, Skeletons)
│   ├── Layout/        # Shell layout components (Sidebar, Top navigation headers)
│   └── Dashboard/     # Widget components
├── context/           # Decomposed React Context state providers (Theme, Auth, Learning, Analytics, Projects)
├── data/              # Mock databases seed data models
├── hooks/             # Custom reusable hooks (e.g. keyboard navigation, document titles)
├── pages/             # Dynamic routes and lazily loaded workspace screens
├── repositories/      # Decoupled Repository Pattern Layer (UserRepository, ProjectRepository, AIRepository)
├── services/          # Business logic and AI Orchestrators:
│   └── ai/            # Multi-Provider AI Provider Engine (OpenAI, Gemini, Claude, Groq, DeepSeek)
├── styles/            # CSS theme variables, transition timings, and component styles
└── utils/             # Reusable helper libraries (Console Logger prefix tools)
```

---

## 📦 UI Component Library Reference

All pages consume unified assets located inside `src/components/Common/`:
- **Notifications**: `Toast.jsx`, `Alert.jsx`, `EmptyState.jsx`, `ErrorState.jsx`, `SuccessState.jsx`, `LoadingState.jsx` (pulsing skeletons).
- **Navigation Controls**: `Drawer.jsx`, `Modal.jsx`, `Dropdown.jsx`, `Tooltip.jsx`, `Pagination.jsx`, `SearchBar.jsx`, `FilterPanel.jsx`.
- **Layout Widgets**: `Button.jsx`, `Card.jsx`, `ProgressCard.jsx`, `Timeline.jsx`, `Badge.jsx`, `Chip.jsx`, `Table.jsx`.

---

## 🤖 Enterprise Multi-Provider AI Engine

Manage AI prompts using the unified client registry container `src/services/ai/`:
- **`providers/index.js`**: Decouples calling strategies for OpenAI, Gemini, Claude, Groq, Ollama, OpenRouter, and DeepSeek.
- **`ChatContext.jsx`**: Selects active strategy, routes queries, and computes approximate character-to-token scales and session pricing costs in real-time.
- **`promptService.js`**: Resolves prompt system template injections.
- **`conversationService.js`**: Manages sliding context history message chains.
- **`embeddingService.js`**: Simulates 1536-dimensional float vector generators.
- **`memoryService.js`**: Persists long-term summaries.
- **`streamingService.js`**: Dispatches text segments callbacks sequentially.

---

## 🗃️ Decoupled Repository Pattern (Dependency Injection)

Data operations are abstracted behind repositories to keep the view layer decoupled from the persistence engines:
- Exported under a central container at `src/repositories/index.js`.
- Shorthand methods `repositories.user()`, `repositories.projects()`, and `repositories.lessons()` access the repositories.
- Support runtime re-binding for tests or database connections:
  ```javascript
  import { repositories } from "./repositories";
  repositories.register("UserRepository", myProductionRepositoryOverride);
  ```

---

## 🏛️ AI Engineer OS V1.5 System Architecture

AI Engineer OS combines a modern React browser application with an optional **Native Node.js Local Runtime Daemon** for host development workflows:

```text
       ┌───────────────────────────────────────────────────────────┐
       │                 Browser UI (React / Vite)                 │
       └─────────────────────────────┬─────────────────────────────┘
                                     │
       ┌─────────────────────────────▼─────────────────────────────┐
       │              AI Orchestrator & Autonomous Agent           │
       └─────────────────────────────┬─────────────────────────────┘
                                     │
       ┌─────────────────────────────▼─────────────────────────────┐
       │         Developer Tool Gateway (runtimeClient.js)          │
       └─────────────────────────────┬─────────────────────────────┘
                                     │
       ┌─────────────────────────────▼─────────────────────────────┐
       │       Permission / Security Layer (Workspace & Policy)    │
       └─────────────────────────────┬─────────────────────────────┘
                                     │ (HTTP / Token Auth)
       ┌─────────────────────────────▼─────────────────────────────┐
       │     Native Node.js Local Runtime Daemon (Port 7070)      │
       └─────────────────────────────┬─────────────────────────────┘
                                     │
       ┌─────────────────────────────▼─────────────────────────────┐
       │      Host OS (Filesystem, Terminal, Git, Node, NPM)        │
       └───────────────────────────────────────────────────────────┘
```

### Core Architecture Layers:
1. **Browser Layer**: React 18 + Vite frontend with glassmorphism UI tokens, multi-tab workspace, and interactive AI chat.
2. **Agent Layer**: Autonomous 10-step execution pipeline (Understand → Scan → Plan → Context → Approval → Tool Exec → Validate → Diff → Checkpoint → Report).
3. **Developer Tool Gateway**: Standardized client interface (`runtimeClient.js`) dispatching tool calls to local daemon or browser fallback.
4. **Local Runtime Daemon**: Standalone Node.js daemon (`runtime/src/index.js`) running on `http://127.0.0.1:7070` for physical file operations, host terminal execution, Git integration, and test runners.
5. **Security & Token Layer**: Canonical path sandboxing (`validateWorkspacePath`), command classification rules (`SAFE`, `APPROVAL_REQUIRED`, `BLOCKED`), localhost binding, token authentication, and secret redaction (`[REDACTED]`).
6. **Browser Fallback Mode**: Graceful transition to in-browser execution when daemon is offline (`○ Browser Mode`).

---

## 🛠️ Developer Setup & Commands

Get the local development server and runtime daemon running:

### 1. Install dependencies
```bash
npm install
```

### 2. Start Local Runtime Daemon (Optional for Host OS execution)
```bash
node runtime/src/index.js
```

### 3. Start hot-reload dev server
```bash
npm run dev
```

### 4. Build optimized production bundle
```bash
npm run build
```
