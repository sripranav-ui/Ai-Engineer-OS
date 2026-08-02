// =======================================================
// marketplaceEngine.js — Plugin Marketplace Registry
// =======================================================
// Manages available plugin registry, categories, installation,
// versions, and compatibility validation.
// =======================================================

export const MARKETPLACE_PLUGINS = [
  {
    id: "github-integration",
    name: "GitHub Integration",
    description: "Sync repository commits, issue milestones, and pull requests directly into your workspace.",
    version: "1.2.0",
    author: "AI Engineer OS Core",
    icon: "💻",
    category: "Developer",
    permissions: ["read:projects", "write:projects", "use:storage"],
    supportedAppVersion: "^1.0.0",
    settings: [{ key: "accessToken", label: "GitHub Access Token", type: "password", value: "" }],
  },
  {
    id: "leetcode-companion",
    name: "LeetCode Companion",
    description: "Fetch daily algorithm challenges, verify coding solutions, and sync solved metrics.",
    version: "1.0.4",
    author: "Community",
    icon: "🧩",
    category: "Developer",
    permissions: ["use:storage", "use:ai"],
    supportedAppVersion: "^1.0.0",
    settings: [{ key: "username", label: "LeetCode Handle", type: "text", value: "" }],
  },
  {
    id: "notion-sync",
    name: "Notion Workspaces Sync",
    description: "Sync study notes, checklist tasks, and research workspace logs to Notion pages.",
    version: "2.0.1",
    author: "Productivity Team",
    icon: "📓",
    category: "Productivity",
    permissions: ["read:notes", "read:projects", "use:storage"],
    supportedAppVersion: "^1.0.0",
    settings: [{ key: "integrationToken", label: "Notion Integration Token", type: "password", value: "" }],
  },
  {
    id: "slack-notifier",
    name: "Slack Webhook Notifications",
    description: "Broadcast study streak milestones and completed project sprints to Slack channels.",
    version: "1.1.0",
    author: "Community",
    icon: "💬",
    category: "Productivity",
    permissions: ["use:notifications", "use:storage"],
    supportedAppVersion: "^1.0.0",
    settings: [{ key: "webhookUrl", label: "Slack Webhook URL", type: "password", value: "" }],
  },
];

export const marketplaceEngine = {
  /** Get all available marketplace plugins */
  getAvailablePlugins: () => MARKETPLACE_PLUGINS,

  /** Get marketplace categories list */
  getCategories: () => ["All", "Developer", "Productivity", "AI Providers", "Platforms"],
};

export default marketplaceEngine;
