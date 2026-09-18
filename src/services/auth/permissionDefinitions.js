/**
 * @file permissionDefinitions.js
 * @description Centralized Capability & Permission Definitions for AI Engineer OS.
 */

export const PERMISSIONS = {
  // --- ASSISTANT ---
  USE_AI_ASSISTANT: "use_ai_assistant",

  // --- CODING ---
  ACCESS_CODING_STUDIO: "access_coding_studio",
  EXECUTE_TERMINAL: "execute_terminal",
  MODIFY_WORKSPACE: "modify_workspace",

  // --- KNOWLEDGE ---
  ACCESS_KNOWLEDGE: "access_knowledge",
  MANAGE_KNOWLEDGE: "manage_knowledge",

  // --- PROJECTS ---
  CREATE_PROJECT: "create_project",
  MODIFY_PROJECT: "modify_project",
  DELETE_PROJECT: "delete_project",

  // --- PLANNER & NOTES ---
  ACCESS_PLANNER: "access_planner",
  MANAGE_TASKS: "manage_tasks",
  ACCESS_NOTES: "access_notes",
  MANAGE_NOTES: "manage_notes",

  // --- AGENT ---
  RUN_AGENT: "run_agent",
  APPROVE_AGENT_ACTIONS: "approve_agent_actions",
  EXECUTE_AGENT_COMMANDS: "execute_agent_commands",

  // --- GITHUB & GIT ---
  CONNECT_GITHUB: "connect_github",
  READ_REPOSITORY: "read_repository",
  READ_REMOTE_REPOSITORY: "read_remote_repository",
  READ_GITHUB_ISSUES: "read_github_issues",
  READ_GITHUB_PULL_REQUESTS: "read_github_pull_requests",
  CREATE_BRANCH: "create_branch",
  SWITCH_BRANCH: "switch_branch",
  CREATE_COMMIT: "create_commit",
  PUSH_REPOSITORY: "push_repository",
  PREPARE_PULL_REQUEST: "prepare_pull_request",
  CREATE_PULL_REQUEST: "create_pull_request",

  // --- RUNTIME ---
  ACCESS_RUNTIME: "access_runtime",
  EXECUTE_RUNTIME_TOOLS: "execute_runtime_tools",

  // --- ADMIN ---
  ACCESS_ADMIN: "access_admin",
  MANAGE_USERS: "manage_users",
  MANAGE_ROLES: "manage_roles",
  MANAGE_SYSTEM_SETTINGS: "manage_system_settings",
  VIEW_AUDIT_LOGS: "view_audit_logs",
  MANAGE_INTEGRATIONS: "manage_integrations",
  MANAGE_RUNTIME_CONFIGURATION: "manage_runtime_configuration",
};

export default PERMISSIONS;
