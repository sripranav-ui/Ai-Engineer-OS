# AI Engineer OS — Product & Design System Bible
> **Version**: 1.0.0 — Canonical Specification  
> **Author**: Apple Human Interface Design, Linear Design Team, Cursor IDE Product Team, Arc Browser Design Team, Raycast Product Team, Notion Design Team, Senior React Software Architects & Design Systems Engineers  
> **Status**: APPROVED & CANONICAL PRODUCTION SPECIFICATION  

---

## Table of Contents
1. [Product Vision](#1-product-vision)
2. [Design Philosophy](#2-design-philosophy)
3. [Target User](#3-target-user)
4. [Visual Language](#4-visual-language)
5. [Complete Color System](#5-complete-color-system)
6. [Typography System](#6-typography-system)
7. [Spacing System](#7-spacing-system)
8. [Border Radius System](#8-border-radius-system)
9. [Shadow System](#9-shadow-system)
10. [Motion System](#10-motion-system)
11. [Iconography](#11-iconography)
12. [Sidebar System](#12-sidebar-system)
13. [Button System](#13-button-system)
14. [Input System](#14-input-system)
15. [Card System](#15-card-system)
16. [Dashboard Philosophy](#16-dashboard-philosophy)
17. [Page Specifications](#17-page-specifications)
18. [Component Library](#18-component-library)
19. [Accessibility](#19-accessibility)
20. [Theme Engine Rules](#20-theme-engine-rules)
21. [Coding Rules](#21-coding-rules)
22. [Quality Checklist](#22-quality-checklist)

---

## 1. Product Vision

### What AI Engineer OS Is
AI Engineer OS is a professional, desktop-grade operating environment engineered specifically for modern AI Engineers, Machine Learning Researchers, and Systems Builders. It integrates project workspace management, copilot AI terminal execution, curriculum roadmaps, knowledge hubs, career tracking, and system diagnostics into a single unified desktop application interface.

### The Problem It Solves
AI Engineers currently operate across fragmented tools: VS Code for coding, Notion for notes, Linear for sprint issues, Terminal/Warp for execution, web browsers for research, and spreadsheets for tracking. This fragmentation causes continuous context switching, cognitive load, and loss of focus. AI Engineer OS unifies these workflows into a high-density, keyboard-driven workstation operating system.

### What Users Should Feel
- **Quiet Command & Flow**: Instant responsiveness, zero visual clutter, and zero friction.
- **Tactile Mastery**: Everything feels physical, solid, crisp, and crafted with extreme precision.
- **Focus & Calm**: The software gets out of the user's way and honors deep technical work.

### What AI Engineer OS Is NOT
- ❌ **NOT an Admin Panel**: No cheap Bootstrap/Tailwind templates with rounded cards and colorful progress widgets.
- ❌ **NOT a Crypto/Web3 Dashboard**: No neon gradients, dark glassmorphism gimmicks, or glowing neon buttons.
- ❌ **NOT a Marketing Web Page**: No huge hero banners, oversized generic icons, or floating decorative blobs.
- ❌ **NOT an Inverted Dark Dashboard in Light Mode**: Light mode is NOT dark mode with inverted colors; it is an independent, crisp, paper-like studio workstation canvas inspired by macOS Settings, Linear Light, and Notion.

---

## 2. Design Philosophy

### Core Principles

1. **Clarity Over Decoration**
   Every pixel must serve a purpose. If a border, background tint, icon, or shadow does not clarify visual structure or visual hierarchy, it must be removed.

2. **Workspace Over Dashboard**
   Dashboards are passive telemetry grids for managers. Workspaces are active environments for creators. AI Engineer OS prioritizes command inputs, interactive project canvases, and code execution over vanity counters.

3. **Focus Over Telemetry**
   Primary interface surfaces highlight active tasks, code editors, and current objectives. Metrics and analytics are secondary and presented with quiet restraint.

4. **Professional Over Playful**
   AI Engineering is high-stakes technical work. The interface uses precise typography, restrained status accents, and zero decorative fluff.

5. **Minimal But Warm**
   Minimalism without warmth is sterile. The Light Theme utilizes warm titanium gold accents (`#C6A47E`) and warm paper surfaces (`#F7F8FA` canvas, `#FFFFFF` cards) to create an inviting, studio-grade aesthetic.

6. **High Information Density Without Clutter**
   Utilizes compact 11px-13px typography, tight 8px grid spacing, crisp hairline borders (`rgba(0,0,0,0.08)`), and structured columns to display maximum context without cognitive overload.

7. **Keyboard-First Workflow**
   Every action, modal, page, search query, and workspace switch can be executed via universal keyboard shortcuts (`Ctrl+K` Command Palette, `Ctrl+Alt+D` Telemetry Console, Arrow key navigation).

8. **Calm Visual Hierarchy**
   Clear 3-tier optical depth:
   - Level 0: Warm Studio Canvas (`#F7F8FA`)
   - Level 1: Elevated Workstation Cards (`#FFFFFF` fill, 1px border `rgba(0,0,0,0.08)`, 2px drop shadow)
   - Level 2: Floating Command Popovers & Overlays (`#FFFFFF` fill, 16px drop shadow, 8px backdrop blur)

---

## 3. Target User

### User Profile
- **Role**: AI Software Engineers, ML Systems Engineers, LLM Researchers, Technical Founders.
- **Environment**: macOS, Windows (PowerShell/Terminal), Linux. Multi-monitor setups.
- **Workflow**: Continuous switching between prompt engineering, model tuning, code editing, task tracking, and literature research.

### Pain Points Solved
- Context loss when switching between code editor, issue tracker, and documentation.
- Ugly, distraction-heavy web dashboards that feel sluggish.
- Lack of keyboard shortcuts for common workflow actions.

---

## 4. Visual Language

AI Engineer OS synthesizes the design language of seven industry-defining desktop applications:

| Product Inspiration | Key Visual & Mechanical Element Borrowed |
| :--- | :--- |
| **Apple macOS Settings** | Crisp typography (`-apple-system`, `Inter`), hairline borders, quiet status badges, restrained color palettes. |
| **Linear Light** | High-density issue rows, 3-tier card hierarchy, subtle hover fills (`#F2F4F7`), Warm Obsidian primary buttons (`#1D1D21`). |
| **Cursor IDE** | Compact sidebar rail, dual split-pane code editor, inline AI copilot prompts, monospaced metadata badges. |
| **Notion** | Paper-like canvas contrast (`#F7F8FA` vs `#FFFFFF`), clean document hierarchy, expandable accordions, minimal icon buttons. |
| **Arc Browser** | Detached floating sidebar rail, subtle glass backdrops, rounded utility cards, tab switcher. |
| **Raycast** | Centered floating command launcher (`Ctrl+K`), instant search indexing, keybinding hints (`kbd`). |
| **GitHub Desktop** | Solid split layout for code diffs, clean status indicators, high-contrast monospace logs. |

---

## 5. Complete Color System

### Semantic Color Token Architecture

The color system uses strictly defined semantic CSS custom properties. Component files must NEVER reference hardcoded hex or RGB strings; they consume semantic token variables only.

#### Light Theme (Primary Experience)

```css
:root, html.light-theme, body.light-theme {
  /* Surfaces & Backgrounds */
  --color-canvas:       #F7F8FA; /* Warm Studio Workspace Base Canvas */
  --color-dock:         #FFFFFF; /* Sidebar & Command Rail Surface */
  --color-panel:        #FFFFFF; /* Primary Workstation Card Panels */
  --color-elevated:     #FFFFFF; /* Floating Popovers & Modals */

  --background:         var(--color-canvas);
  --surface-ground:     var(--color-dock);
  --surface-1:          var(--color-panel);
  --surface-2:          #FFFFFF; /* Card Surface */
  --surface-3:          #F2F4F7; /* Interactive Hover & Selected Row Fill */
  --surface-4:          #EAECEF; /* Track Fill & Inset Container */
  --surface-overlay:    rgba(247, 248, 250, 0.88); /* Modal Backdrop Blur */
  --surface-glass:      rgba(255, 255, 255, 0.92);

  /* Hairline Borders & Dividers */
  --border-subtle:      rgba(0, 0, 0, 0.04);
  --border-default:     rgba(0, 0, 0, 0.08); /* Standard Hairline Border */
  --border-strong:      rgba(0, 0, 0, 0.14); /* Input & Active Focus Border */
  --border-accent:      rgba(198, 164, 126, 0.35); /* Titanium Gold Accent Border */
  --border-hover:       rgba(0, 0, 0, 0.18);
  --divider:            rgba(0, 0, 0, 0.06);

  /* High Contrast Typography */
  --text-primary:       #1D1D1F; /* Primary Title Black */
  --text-secondary:     #5B6472; /* High Legibility Body Slate */
  --text-tertiary:      #8A93A2; /* Metadata, Labels & Captions */
  --text-ghost:         #A1A8B4; /* Hints & Inactive Shortcuts */
  --text-inverse:       #FFFFFF;

  /* Accent Palette (Warm Titanium Gold & Deep Obsidian) */
  --accent:             #1D1D21; /* Primary Button & Active Rail Obsidian Accent */
  --accent-hover:       #2C2C33;
  --accent-gold:        #C6A47E; /* Warm Titanium Gold Highlight */
  --accent-muted:       rgba(198, 164, 126, 0.15);
  --accent-subtle:      rgba(198, 164, 126, 0.08);

  /* Functional Status Tokens */
  --success:            #2E7D52;
  --success-muted:      rgba(46, 125, 82, 0.08);
  --warning:            #9A722E;
  --warning-muted:      rgba(154, 114, 46, 0.08);
  --danger:             #C53929;
  --danger-muted:       rgba(197, 57, 41, 0.08);
  --info:               #4A5568;
  --info-muted:         rgba(74, 85, 104, 0.08);
}
```

#### Dark Theme (Secondary Studio Option)

```css
html.dark-theme, body.dark-theme {
  --color-canvas:       #09090B;
  --color-dock:         #0E0F12;
  --color-panel:        #121317;
  --color-elevated:     #17191F;

  --background:         var(--color-canvas);
  --surface-ground:     var(--color-dock);
  --surface-1:          var(--color-panel);
  --surface-2:          var(--color-elevated);
  --surface-3:          #1F2129;
  --surface-4:          #272A34;
  --surface-overlay:    rgba(9, 9, 11, 0.94);
  --surface-glass:      rgba(18, 19, 23, 0.88);

  --border-subtle:      rgba(255, 255, 255, 0.04);
  --border-default:     rgba(255, 255, 255, 0.08);
  --border-strong:      rgba(255, 255, 255, 0.14);
  --border-accent:      rgba(198, 164, 126, 0.35);
  --border-hover:       rgba(255, 255, 255, 0.18);
  --divider:            rgba(255, 255, 255, 0.06);

  --text-primary:       #F3F3F5;
  --text-secondary:     #9496A1;
  --text-tertiary:      #60626C;
  --text-ghost:         #4B4D58;
  --text-inverse:       #09090B;

  --accent:             #C6A47E;
  --accent-hover:       #D4B38D;
  --accent-gold:        #C6A47E;
  --accent-muted:       rgba(198, 164, 126, 0.15);
  --accent-subtle:      rgba(198, 164, 126, 0.08);

  --success:            #34D399;
  --success-muted:      rgba(52, 211, 153, 0.12);
  --warning:            #FBBF24;
  --warning-muted:      rgba(251, 191, 36, 0.12);
  --danger:             #F87171;
  --danger-muted:       rgba(248, 113, 113, 0.12);
  --info:               #60A5FA;
  --info-muted:         rgba(96, 165, 250, 0.12);
}
```

---

## 6. Typography System

### Font Stacks
- **Display / Title**: `'Geist', 'Inter', -apple-system, sans-serif`
- **Body / Sans**: `'Inter', 'Geist', system-ui, sans-serif`
- **Monospace / Code**: `'JetBrains Mono', 'SF Mono', 'Fira Code', monospace`

### Type Scale & Specs

| Role | Class / Token | Font Size | Weight | Line Height | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Display** | `--text-hero` | 42px | 800 | 1.08 | `-0.04em` |
| **Page Title (H1)** | `--text-3xl` | 32px | 700 | 1.12 | `-0.035em` |
| **Section Title (H2)**| `--text-2xl` | 24px | 700 | 1.20 | `-0.025em` |
| **Card Header (H3)** | `--text-xl` | 18px | 650 | 1.25 | `-0.02em` |
| **Subsection (H4)** | `--text-lg` | 16px | 600 | 1.30 | `-0.015em` |
| **Body Regular** | `--text-base` | 14.5px | 400 | 1.60 | `0em` |
| **Body Medium** | `--text-sm` | 13px | 500 | 1.50 | `0em` |
| **Caption / Meta** | `--text-xs` | 11px | 500 | 1.40 | `0.02em` |
| **Mono Badge / Code**| `--text-2xs` | 10px | 600 (Mono) | 1.30 | `0.10em` (Caps) |

---

## 7. Spacing System

Strict **8-Point Grid System** for macro layout structural rhythm, with 4pt subdivisions for micro control targets.

```css
--space-0:    0px;
--space-1:    4px;   /* Micro padding / gap */
--space-2:    8px;   /* Small element gap */
--space-3:    12px;  /* Compact padding */
--space-4:    16px;  /* Standard component padding */
--space-5:    20px;  /* Card inner padding */
--space-6:    24px;  /* Section gap */
--space-8:    32px;  /* Major layout gap */
--space-10:   40px;  /* Modal / Banner padding */
--space-12:   48px;  /* Page section margin */
--space-16:   64px;  /* Structural container margin */
```

---

## 8. Border Radius System

```css
--radius-xs:    3px;   /* Badges, kbd tags, micro tags */
--radius-sm:    6px;   /* Buttons, inputs, search bars, selects */
--radius-md:    10px;  /* Standard cards, popovers, dropdown menus */
--radius-lg:    16px;  /* Hero panels, modals, floating sidebar rail */
--radius-xl:    20px;  /* Floating command palette container */
--radius-full:  9999px;/* Avatars, pill badges, toggle switches */
```

---

## 9. Shadow System

Quiet, ambient dropshadows for Light Mode. Light Theme shadows avoid heavy black blur; they use low-opacity layered drop shadows to feel natural.

```css
/* Light Theme Quiet Shadows */
--shadow-xs:    0 1px 2px rgba(0, 0, 0, 0.03);
--shadow-sm:    0 2px 8px rgba(0, 0, 0, 0.04);
--shadow-md:    0 4px 16px rgba(0, 0, 0, 0.05);
--shadow-lg:    0 8px 24px rgba(0, 0, 0, 0.06);
--shadow-xl:    0 16px 40px rgba(0, 0, 0, 0.08);
--shadow-float: 0 24px 60px rgba(0, 0, 0, 0.10);
```

---

## 10. Motion System

Physical deceleration motion curves (`cubic-bezier(0.16, 1, 0.3, 1)`):

```css
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
--ease-smooth:   cubic-bezier(0.4, 0, 0.2, 1);

--duration-fast: 120ms; /* Button press, checkbox toggle */
--duration-base: 180ms; /* Hover states, dropdown open */
--duration-slow: 300ms; /* Sidebar expand, modal enter, page transition */
```

---

## 11. Iconography

- **Library**: `react-icons/fa` (FontAwesome V6 Crisp Vectors).
- **Stroke & Size Rules**:
  - Rail & Navigation Icons: `14px`, opacity `0.70` resting, `1.0` hover/active.
  - Action Button Icons: `13px`.
  - Header & Section Title Icons: `16px`.
  - Inline Metadata Icons: `11px`.
- **Alignment**: Center-aligned with text baselines via `display: inline-flex; align-items: center;`.

---

## 12. Sidebar System

### Specification
The Sidebar is a **Floating Detached Studio Rail** (Arc & macOS inspired):
- **Position**: `fixed`, left `16px`, top `16px`, bottom `16px`.
- **Collapsed Width**: `72px` (icon rail mode).
- **Expanded Width**: `260px` (expands smoothly on hover or toggle).
- **Surface**: `--surface-1` (`#FFFFFF`), border `1px solid var(--border-default)`, shadow `var(--shadow-md)`.
- **Active Navigation Item**: Fills with `--surface-3` (`#F2F4F7`), bold text (`#1D1D1F`), and a `3px` Warm Titanium Gold accent bar on the left edge (`var(--accent-gold)`).

---

## 13. Button System

### Button Variants Matrix

| Type | Class | Background | Text Color | Border | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Primary** | `.btn-primary` | `var(--accent)` (`#1D1D21`) | `#FFFFFF` | `rgba(29,29,33,0.4)` | Main page CTA, submission |
| **Secondary** | `.btn-secondary` | `var(--surface-3)` (`#F2F4F7`)| `var(--text-primary)` | `var(--border-default)` | Secondary actions, filters |
| **Ghost** | `.btn-ghost` | `transparent` | `var(--text-secondary)`| `transparent` | Inline links, toolbar tools |
| **Outline** | `.btn-outline` | `#FFFFFF` | `var(--text-primary)` | `var(--border-strong)` | Cancel, secondary options |
| **Danger** | `.btn-danger` | `var(--danger)` | `#FFFFFF` | `transparent` | Destructive actions |

---

## 14. Input System

### Control Separation Rules
- **Inputs on Cards**: Card background is `#FFFFFF`. Inputs MUST stay separated by utilizing crisp hairline borders (`1px solid var(--border-strong)` / `rgba(0,0,0,0.14)`), `inset 0 1px 2px rgba(0,0,0,0.03)` depth, and a `--text-tertiary` (`#8A93A2`) placeholder color.
- **Focus Halo**: 3px ring of `var(--accent-muted)` (`rgba(198,164,126,0.20)`).

---

## 15. Card System

### 3-Tiered Visual Hierarchy

1. **Tier 1: Primary Focal Hero Cards** (`.card-primary`, `.hero-panel`)
   - Surface `#FFFFFF`, border `1px solid var(--border-accent)` (`rgba(198,164,126,0.35)`), shadow `var(--shadow-md)`. Top 1px sheen line.
2. **Tier 2: Interactive Core Cards** (`.card`, `.card-interactive`)
   - Surface `#FFFFFF`, border `1px solid var(--border-default)` (`rgba(0,0,0,0.08)`), shadow `var(--shadow-sm)`.
3. **Tier 3: Utility & Inset Cards** (`.card-flat`, `.card-tertiary`)
   - Surface `var(--surface-3)` (`#F2F4F7`), border `1px solid var(--border-subtle)`, zero heavy drop shadow.

---

## 16. Dashboard Philosophy

### Why Traditional Dashboards Fail
Traditional dashboards fail because they present static, un-actionable graphs designed for upper management rather than tools for active engineering.

### The AI Engineer OS Workspace Approach
AI Engineer OS places **Active Command & Execution** above the fold:
1. **Raycast AI Launcher Bar**: Instant prompt & action trigger at the top of the workspace.
2. **Current Objective & Active Project Status**: Immediate visibility into active code repositories and sprint tasks.
3. **Interactive Workspace Grid**: 68%/32% asymmetrical split layout for code execution alongside quick tools.

---

## 17. Page Specifications

### 1. Workspace Hub (`/workspace`)
- **Purpose**: Primary command center for active engineering sessions.
- **Above The Fold**: AI Command Bar, active project resume card, commit graph.

### 2. AI Coding Workspace IDE (`/coding-workspace`)
- **Purpose**: Dual split-pane code editor, file explorer, integrated terminal, and copilot chat.

### 3. Portfolio Builder Hub (`/portfolio`)
- **Purpose**: Showcasing completed AI projects, benchmarks, and deployment URLs.

### 4. Learning Center Modules (`/learning`)
- **Purpose**: Curriculum modules, interactive quizzes, and lesson video playback.

### 5. Curriculum Roadmap (`/roadmap`)
- **Purpose**: Interactive timeline for AI engineering mastery milestones.

### 6. Calendar & Schedule Planner (`/planner`)
- **Purpose**: Time-blocked task scheduling, sprint deadlines, and Pomodoro timer.

### 7. Projects Kanban Board (`/projects`)
- **Purpose**: 4-column sprint board (Backlog, To Do, In Progress, Completed).

### 8. Knowledge Hub Workspace (`/knowledge`)
- **Purpose**: Markdown notes workspace, formula cheatsheets, and flashcard review.

### 9. AI Career Coach Console (`/career-coach`)
- **Purpose**: Resume parsing, mock interview feedback, and career progression tracking.

### 10. Account & Theme Settings (`/settings`)
- **Purpose**: Profile customization, theme selection, and API key configurations.

---

## 18. Component Library

Every reusable component must follow the canonical specs:
- `Card`: `.card`, `.card-primary`, `.card-flat`, `.card-interactive`
- `Input`: `.form-input`, `.form-textarea`, `.form-select`, `.form-checkbox`, `.toggle-switch`
- `Button`: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-outline`, `.btn-danger`
- `Badge`: `.badge`, `.badge-accent`, `.badge-success`, `.badge-warning`, `.badge-danger`
- `Modal`: `.modal`, `.modal-overlay`, `.modal-content`
- `Toast`: `.toast-item`, `.toast-container-fixed`
- `Table`: `.table-container`, `.data-table`

---

## 19. Accessibility

- **Contrast Ratios**: Primary text (`#1D1D1F`) on Canvas (`#F7F8FA`) achieves **16.5:1** contrast ratio (surpasses AAA standard).
- **Focus Rings**: All interactive controls have visible keyboard focus halos (`3px var(--accent-muted)`).
- **Screen Readers**: All icon buttons include descriptive `aria-label` attributes.

---

## 20. Theme Engine Rules

### Zero Hardcoded Colors
Component CSS files and inline JSX styles MUST use CSS custom variables (`var(--surface-1)`, `var(--text-primary)`, `var(--border-default)`).

### FOUC Prevention & Persistence
Initial theme is resolved synchronously from `localStorage` in `ThemeContext.jsx` and applied directly to `document.documentElement` before rendering:

```js
const applyThemeToDOM = (targetTheme) => {
  const themeClass = targetTheme === "light" 
    ? "light-theme" 
    : (targetTheme.startsWith("theme-") ? targetTheme : `theme-${targetTheme}`);
  document.documentElement.className = themeClass;
  document.documentElement.setAttribute("data-theme", targetTheme);
  if (document.body) document.body.className = themeClass;
};
```

---

## 21. Coding Rules

1. **Never Hardcode Colors**: Always use CSS variables (`var(--surface-1)`, `var(--text-primary)`).
2. **Never Duplicate Spacing**: Follow the 8pt grid token scale (`var(--space-1)` to `var(--space-16)`).
3. **Never Create Page-Specific Buttons**: Use canonical `.btn` suite.
4. **Always Obey 3-Tier Card Depth**: Canvas (`#F7F8FA`) → Card (`#FFFFFF`) → Input (`#FFFFFF` + Hairline Border).

---

## 22. Quality Checklist

Before merging any new page or component:
- [x] Does the Light Mode canvas match `#F7F8FA`?
- [x] Are cards white (`#FFFFFF`) with `1px solid rgba(0,0,0,0.08)` hairline borders?
- [x] Do inputs separate cleanly from white cards?
- [x] Is text legibility sharp and contrast > 7:1?
- [x] Does `npm run build` complete with 0 errors?
- [x] Does `oxlint` return 0 rules-of-hooks errors?
