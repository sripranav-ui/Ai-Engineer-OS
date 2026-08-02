// =======================================================
// navigation.js — Single Source of Truth for Application Routes
// =======================================================
// All navigation data lives here. Sidebar, CommandPalette,
// Breadcrumb, and any future navigation consumer imports from
// this registry. Eliminates duplication between MENU_ITEMS
// and PAGES_LIST.
//
// Fields:
//   id        — unique string identifier
//   path      — react-router route path
//   label     — human-readable display name
//   icon      — emoji or icon key (resolved per consumer)
//   category  — grouping for sidebar sections
//   search    — include in command palette search (default true)
//   hidden    — exclude from sidebar nav (still routable)
//   permission — required permission string (null = public)
//   breadcrumb — override label shown in breadcrumb trail
// =======================================================

export const NAV_CATEGORIES = {
  CORE:       "Core",
  LEARN:      "Learn",
  BUILD:      "Build",
  CAREER:     "Career",
  COMMUNITY:  "Community",
  SYSTEM:     "System",
};

/** @type {NavRoute[]} */
export const NAV_ROUTES = [
  // ─── Core ───────────────────────────────────────────
  {
    id:         "dashboard",
    path:       "/",
    label:      "Dashboard",
    icon:       "home",
    category:   NAV_CATEGORIES.CORE,
    search:     true,
    hidden:     false,
    permission: null,
    breadcrumb: "Home",
  },
  {
    id:         "workspace",
    path:       "/workspace",
    label:      "Workspace Hub",
    icon:       "workspace",
    category:   NAV_CATEGORIES.CORE,
    search:     true,
    hidden:     false,
    permission: null,
    breadcrumb: "Workspace",
  },
  {
    id:         "assistant",
    path:       "/assistant",
    label:      "AI Copilot",
    icon:       "robot",
    category:   NAV_CATEGORIES.CORE,
    search:     true,
    hidden:     false,
    permission: null,
    breadcrumb: "AI Copilot",
  },
  {
    id:         "analytics",
    path:       "/analytics",
    label:      "Analytics",
    icon:       "chart",
    category:   NAV_CATEGORIES.CORE,
    search:     true,
    hidden:     false,
    permission: null,
    breadcrumb: "Analytics",
  },

  // ─── Learn ──────────────────────────────────────────
  {
    id:         "learning",
    path:       "/learning",
    label:      "Learn",
    icon:       "book",
    category:   NAV_CATEGORIES.LEARN,
    search:     true,
    hidden:     false,
    permission: "use:learning",
    breadcrumb: "Learning Center",
  },
  {
    id:         "roadmap",
    path:       "/roadmap",
    label:      "Build Roadmap",
    icon:       "map",
    category:   NAV_CATEGORIES.LEARN,
    search:     true,
    hidden:     false,
    permission: "use:learning",
    breadcrumb: "Roadmap",
  },
  {
    id:         "planner",
    path:       "/planner",
    label:      "Planner",
    icon:       "calendar",
    category:   NAV_CATEGORIES.LEARN,
    search:     true,
    hidden:     false,
    permission: "use:planner",
    breadcrumb: "Research Workspace",
  },
  {
    id:         "gamification",
    path:       "/gamification",
    label:      "Gamification",
    icon:       "trophy",
    category:   NAV_CATEGORIES.LEARN,
    search:     true,
    hidden:     false,
    permission: "use:learning",
    breadcrumb: "Gamification Hub",
  },
  {
    id:         "certificates",
    path:       "/certificates",
    label:      "Certificates",
    icon:       "award",
    category:   NAV_CATEGORIES.LEARN,
    search:     true,
    hidden:     false,
    permission: "use:learning",
    breadcrumb: "Certificates Locker",
  },

  // ─── Build ──────────────────────────────────────────
  {
    id:         "projects",
    path:       "/projects",
    label:      "Projects",
    icon:       "folder",
    category:   NAV_CATEGORIES.BUILD,
    search:     true,
    hidden:     false,
    permission: "use:projects",
    breadcrumb: "Project Universe",
  },
  {
    id:         "coding-workspace",
    path:       "/coding-workspace",
    label:      "IDE Workspace",
    icon:       "code",
    category:   NAV_CATEGORIES.BUILD,
    search:     true,
    hidden:     false,
    permission: null,
    breadcrumb: "Coding Workspace",
  },
  {
    id:         "knowledge",
    path:       "/knowledge",
    label:      "Knowledge Hub",
    icon:       "notes",
    category:   NAV_CATEGORIES.BUILD,
    search:     true,
    hidden:     false,
    permission: null,
    breadcrumb: "Knowledge Hub",
  },
  {
    id:         "notes",
    path:       "/notes",
    label:      "Notes",
    icon:       "brain",
    category:   NAV_CATEGORIES.BUILD,
    search:     true,
    hidden:     false,
    permission: "use:notes",
    breadcrumb: "Notes",
  },

  // ─── Career ─────────────────────────────────────────
  {
    id:         "career-coach",
    path:       "/career-coach",
    label:      "Career Coach",
    icon:       "graduate",
    category:   NAV_CATEGORIES.CAREER,
    search:     true,
    hidden:     false,
    permission: "use:career",
    breadcrumb: "AI Career Coach",
  },
  {
    id:         "placement",
    path:       "/placement",
    label:      "Placement",
    icon:       "briefcase",
    category:   NAV_CATEGORIES.CAREER,
    search:     true,
    hidden:     false,
    permission: "use:career",
    breadcrumb: "Placement Tracker",
  },
  {
    id:         "interview-prep",
    path:       "/interview-prep",
    label:      "Interview Prep",
    icon:       "interview",
    category:   NAV_CATEGORIES.CAREER,
    search:     true,
    hidden:     false,
    permission: "use:career",
    breadcrumb: "Interview Prep",
  },
  {
    id:         "resume-builder",
    path:       "/resume-builder",
    label:      "Resume Builder",
    icon:       "resume",
    category:   NAV_CATEGORIES.CAREER,
    search:     true,
    hidden:     false,
    permission: "use:career",
    breadcrumb: "Resume Builder",
  },
  {
    id:         "portfolio",
    path:       "/portfolio",
    label:      "Portfolio Hub",
    icon:       "portfolio",
    category:   NAV_CATEGORIES.CAREER,
    search:     true,
    hidden:     false,
    permission: null,
    breadcrumb: "Portfolio Hub",
  },

  // ─── Community ──────────────────────────────────────
  {
    id:         "community",
    path:       "/community",
    label:      "Community Hub",
    icon:       "users",
    category:   NAV_CATEGORIES.COMMUNITY,
    search:     true,
    hidden:     false,
    permission: null,
    breadcrumb: "Community",
  },

  // ─── System ─────────────────────────────────────────
  {
    id:         "plugins",
    path:       "/plugins",
    label:      "Plugins & Marketplace",
    icon:       "plug",
    category:   NAV_CATEGORIES.SYSTEM,
    search:     true,
    hidden:     false,
    permission: null,
    breadcrumb: "Plugins",
  },
  {
    id:         "settings",
    path:       "/settings",
    label:      "Settings",
    icon:       "cog",
    category:   NAV_CATEGORIES.SYSTEM,
    search:     true,
    hidden:     false,
    permission: "use:settings",
    breadcrumb: "Settings",
  },
  {
    id:         "profile",
    path:       "/profile",
    label:      "Profile",
    icon:       "user",
    category:   NAV_CATEGORIES.SYSTEM,
    search:     true,
    hidden:     false,
    permission: null,
    breadcrumb: "Profile",
  },
];

// ─── Lookup helpers ──────────────────────────────────────

/** Fast O(1) lookup by path */
const _byPath = new Map(NAV_ROUTES.map((r) => [r.path, r]));

/** Find a route by its path string */
export function getRouteByPath(path) {
  return _byPath.get(path) ?? null;
}

/** Get all routes for a given category */
export function getRoutesByCategory(category) {
  return NAV_ROUTES.filter((r) => r.category === category);
}

/** Get routes visible in the sidebar (not hidden) */
export function getSidebarRoutes() {
  return NAV_ROUTES.filter((r) => !r.hidden);
}

/** Get routes included in search (command palette) */
export function getSearchableRoutes() {
  return NAV_ROUTES.filter((r) => r.search);
}

/** Given current pathname, build breadcrumb trail segments */
export function buildBreadcrumbs(pathname) {
  const route = getRouteByPath(pathname);
  if (!route) return [];

  const crumbs = [];

  // Always prepend Home unless we are already on it
  if (pathname !== "/") {
    crumbs.push({ label: "Home", path: "/" });
  }

  // Category as intermediate crumb
  if (route.category && route.category !== NAV_CATEGORIES.CORE) {
    crumbs.push({ label: route.category, path: null });
  }

  crumbs.push({ label: route.breadcrumb || route.label, path: pathname });
  return crumbs;
}
