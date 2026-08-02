# UI INVENTORY — AI ENGINEER OS

> **Inventory Date**: 2026-07-28  
> **Target Application**: AI Engineer OS (Desktop Operating System & AI Workstation)  
> **Status**: COMPLETE FRONTEND UI INVENTORY (READ-ONLY ANALYSIS)

---

## 1. Core Architecture & Design System Tokens

### A. Design Philosophy & Theme System
- **Dual Surface Architecture**:
  - **Light Studio Mode**: High-legibility crisp canvas (`#F7F8FA`), pure white cards (`#FFFFFF`), hairline borders (`rgba(0,0,0,0.08)`), primary text (`#1D1D1F`).
  - **Dark Operating Mode**: Slate dark canvas (`#09090B` / `bg-slate-950`), elevated cards (`#121317` / `bg-slate-900`), borders (`rgba(255,255,255,0.07)` / `border-slate-800`), primary text (`#F3F3F5` / `text-slate-100`).
- **Typography Scale**:
  - `Display / Headings`: `Geist`, `Inter`, `-apple-system`, `sans-serif`
  - `Body / UI`: `Inter`, `Geist`, `system-ui`, `sans-serif`
  - `Code / Telemetry`: `JetBrains Mono`, `SF Mono`, `monospace`
  - `Scale`: `2xs` (10px), `xs` (11px), `sm` (13px), `base` (14.5px), `md` (16.5px), `lg` (20px), `xl` (24px), `2xl` (32px), `3xl` (42px).

### B. Elevation, Spacing & Border Radii
- **Radii Scale**: `xs` (3px), `sm` (6px), `md` (10px), `lg` (16px), `xl` (20px), `2xl` (24px), `full` (9999px).
- **Shadow Scale**: `shadow-xs` through `shadow-xl`, `shadow-float`, `shadow-glow`.
- **Spacing Scale**: 0px to 128px (`--space-1` through `--space-32`).

---

## 2. Layout Structure & Shell Inventory

### A. Main Desktop Layout (`DesktopLayout.jsx`)
- **Structure**: 2-Row Full Screen Grid (`h-screen w-screen bg-slate-950 text-slate-100 flex flex-col`).
- **Top Section**: Workspace viewport (`h-[calc(100vh-28px)] flex w-full relative overflow-hidden`).
- **Bottom Section**: OS Telemetry Bar (`BottomStatusBar.jsx`, `h-7 28px`).

### B. Activity Rail (`ActivityBar.jsx`)
- **Width**: `w-14` fixed rail (`bg-slate-950 border-r border-slate-800/80`).
- **Launcher Button**: `Zap` icon launcher triggering Ctrl+K Command Palette.
- **Hub Navigation Icons (18 Items)**:
  1. Dashboard (`LayoutDashboard`)
  2. AI Assistant (`MessageSquare`)
  3. Coding Workspace (`Code`)
  4. Learning Hub (`GraduationCap`)
  5. Projects (`Folder`)
  6. Knowledge Graph (`Share2`)
  7. Workflow Builder (`GitMerge`)
  8. Memory Explorer (`Database`)
  9. Task Manager (`CheckSquare`)
  10. Notes (`FileText`)
  11. Career Coach (`Briefcase`)
  12. Community (`Users`)
  13. Plugin Marketplace (`Puzzle`)
  14. MCP Manager (`Server`)
  15. Automation (`Zap`)
  16. Analytics (`BarChart2`)
  17. Terminal (`Terminal`)
  18. Settings (`Settings`)
- **Active State Indicator**: Active icon highlights in `bg-indigo-600 text-white shadow-lg shadow-indigo-600/30` with left indicator dot.

### C. Sidebar (`DesktopSidebar.jsx`)
- **Width**: `w-56` fixed sidebar (`bg-slate-950/90 border-r border-slate-800/80 p-3`).
- **Active Context Cards**:
  - `Workspace`: Active workspace name (`AI Engineer OS`).
  - `Current Project`: Selected active project (`Default Workspace`).
  - `Active View`: Current tab name.
- **Quick Navigation Menu**: Vertical list of 18 interactive navigation items.

### D. Main Workspace Viewport (`DesktopMainWorkspace.jsx`)
- **Container**: `flex-1 h-full w-full bg-slate-950 overflow-hidden relative`.
- **Renders**: Matched React Router `<Route>` pages or state-driven fallback desktop window components.

### E. Context Inspector (`RightInspector.jsx`)
- **Width**: `w-72` right drawer (`bg-slate-950 border-l border-slate-800/80 p-4`).
- **Sections**: RAG Query Metrics (Total queries, cache hit rate), Memory Cache status, Execution Pipeline metrics, Active Agents count.

### F. Status Bar (`BottomStatusBar.jsx`)
- **Height**: `h-7` status bar (`bg-slate-950 border-t border-slate-800/80 px-3 text-[11px] font-mono`).
- **Telemetry Display**: OS status (`OS Online 200 OK`), Active Page indicator, Active Agent execution count.

---

## 3. Screen & Feature Windows Inventory

### 1. Operations Center Dashboard (`AIDashboardWindow.jsx`)
- **Layout**: CSS Grid (`dashboard-grid`).
- **Widgets**:
  - `OperationsHeroCard`: Gradient hero card with real-time status.
  - `CommandShortcutCard`: Interactive Ctrl+K shortcut launcher card.
  - `QuickActionsCard`: Launcher buttons for quick actions.
  - `RecentProjectsCard`: List of active workspace projects.
  - `RunningAgentsWidget`: Active autonomous agent tasks & status.
  - `RunningWorkflowsWidget`: Executing DAG workflow pipelines.
  - `MemoryUsageWidget`: Vector DB & Short/Long term memory stats.
  - `PluginMCPWidget`: Active MCP server status & installed plugins.
  - `SystemHealthWidget`: CPU, Memory, API latency telemetry.
  - `TaskProgressWidget`: Queued tasks & progress bars.
  - `KnowledgeSourcesWidget`: Vector index documents & graph nodes.
  - `RecentActionsWidget`: Live audit log / event feed.
  - `ExecutionStatsWidget`: Cumulative runtime & token usage stats.

### 2. Workspace Dashboard (`WorkspaceDashboard.jsx`)
- **Sections**:
  - `Today's Tasks`: Task list with priority badges (High, Medium, Low) and XP rewards.
  - `Recent Projects`: Live project grid from `ProjectsContext`.
  - `AI Recommendations`: Personalized coding & learning recommendations.
  - `Progress Widgets`: XP level indicator, streak counter, roadmap progress bar.
  - `Quick Actions`: Grid of navigation cards.

### 3. AI Assistant / Chat (`AIChatWindow.jsx` / `AssistantPage.jsx`)
- **Layout**: 2-Column Split (Session History Sidebar + Main Chat Viewport).
- **Session Sidebar**: List of previous chat threads, search input, "New Chat" button.
- **Message List**:
  - User messages: Right-aligned indigo bubbles.
  - Assistant messages: Left-aligned slate-900 cards with Markdown formatting, code block syntax highlighting, and copy-code buttons.
- **Composer**: Expanding textarea, file upload launcher, LLM model selector dropdown, Send button.

### 4. Workflow Builder (`WorkflowBuilderWindow.jsx`)
- **Layout**: Canvas Engine with Top Control Toolbar & Side Palette.
- **Node Palette**: Drag-and-drop nodes (Agent Node, RAG Node, Function Node, Condition Node, Output Node).
- **Canvas Viewport**: Interactive node graph with connecting lines.
- **Node Inspector**: Right panel for configuring node inputs, prompts, parameters.
- **Control Bar**: Run Workflow, Pause, Reset, Export JSON actions.

### 5. Knowledge Graph (`KnowledgeGraphWindow.jsx`)
- **Components**: `GraphCanvas.jsx`, `GraphFiltersBar.jsx`, `NodeInspectorDrawer.jsx`.
- **Canvas**: Interactive force-directed 2D graph visualizing nodes (Concepts, Code, Documents, Entities) and relationship edges.
- **Filters Bar**: Entity type toggles (Concept, Project, Code, Document), search input, zoom in/out controls.
- **Node Inspector Drawer**: Slide-out panel displaying node properties, connections, and vector similarity scores.

### 6. Memory Explorer (`MemoryExplorerWindow.jsx`)
- **Tabs**: Short-Term Working Memory, Long-Term Semantic Memory, Vector Embeddings.
- **Features**: Search bar, filter dropdown, memory key-value inspector table, similarity threshold slider, memory purge action button.

### 7. Task Manager / Planner (`PlannerPage.jsx`)
- **Views**: Kanban Board / List View toggle.
- **Kanban Columns**: Backlog, In Progress, Under Review, Completed.
- **Cards**: Task title, priority badge, due date, assigned agent/user avatar, XP reward tag.

### 8. Plugin Marketplace & MCP Manager (`PluginMarketplaceWindow.jsx`, `MCPManagementWindow.jsx`)
- **Marketplace**: Grid of plugin cards with icon, title, author, description, category filter, Install/Uninstall buttons.
- **MCP Manager**: MCP server configuration form (Host, Port, Protocol), active tools list, server status toggle switches.

### 9. Terminal & Automation & DevTools (`TerminalWindow.jsx`, `AutomationWindow.jsx`, `DeveloperToolsWindow.jsx`)
- **Terminal**: Simulated shell CLI (`bg-black font-mono text-emerald-400`), command prompt line, command execution history log.
- **Automation**: Trigger-Action event listeners list (CRON, Webhooks, System Events), live execution status.
- **DevTools**: Real-time event log, state inspector, performance telemetry charts, memory dump tool.

### 10. Settings (`SettingsPanelWindow.jsx`, `SettingsPage.jsx`)
- **Navigation Tabs**: General, Appearance & Theme, AI Model API Keys, MCP & Plugins, Account & Security.
- **Controls**: Theme selector dropdown, API key input fields with reveal/hide toggle, feature toggle switches.

---

## 4. Reusable Component Primitives Inventory

| Primitive Component | Location | Description |
| :--- | :--- | :--- |
| `Button.jsx` | `src/components/Common/Button.jsx` | Variants: primary, secondary, ghost, danger, icon. |
| `Card.jsx` | `src/components/Common/Card.jsx` | Container with border, padding, hover styles. |
| `Input.jsx` / `FormControls.jsx` | `src/components/Common/` | Styled text input, textarea, checkbox, radio, toggle switch. |
| `Modal.jsx` / `CommandPalette.jsx` | `src/components/Common/` | Centered modal backdrop, keyboard escape handler, close button. |
| `Badge.jsx` / `Chip.jsx` | `src/components/Common/` | Small status pills (success, warning, danger, info, indigo). |
| `Avatar.jsx` | `src/components/Common/Avatar.jsx` | User/Agent avatar image or initials fallback. |
| `ProgressBar.jsx` / `CircularProgress` | `src/components/Common/` | Animated progress indicator bars and rings. |
| `Skeleton.jsx` | `src/components/Common/Skeleton.jsx` | Skeleton loading placeholder blocks. |
| `EmptyState.jsx` / `ErrorState.jsx` | `src/components/Common/` | Empty state artwork, title, subtitle, call-to-action button. |
| `Table.jsx` | `src/components/Common/Table.jsx` | Styled data table with sortable columns and pagination. |
| `Tabs.jsx` | `src/components/Common/Tabs.jsx` | Horizontal tab bar with active indicator underline/pill. |
| `Toast.jsx` / `NotificationCenter` | `src/components/Common/` | Floating toast notifications and notification drawer. |
