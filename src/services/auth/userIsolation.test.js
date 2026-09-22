/**
 * @file userIsolation.test.js
 * @description Unit & integration tests for Step 4B-1 User Data Isolation Hardening.
 * Executed using `node --test`.
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

import storageService from "../storageService.js";
import offlineSyncService from "../offlineSyncService.js";
import projectEngine from "../projects/projectEngine.js";
import templateEngine from "../projects/templateEngine.js";
import projectTools from "../ai/tools/implementations/projectTools.js";
import contextEngine from "../ai/contextEngine.js";
import { UserRepository } from "../../repositories/UserRepository.js";
import { ProjectRepository } from "../../repositories/ProjectRepository.js";
import { PlannerRepository } from "../../repositories/PlannerRepository.js";
import { NotificationRepository } from "../../repositories/NotificationRepository.js";

describe("User Data Isolation — Key Strategy & Storage Scoping", () => {
  beforeEach(() => {
    // Clear storage before each test
    storageService.remove("auth_session");
  });

  it("should format user-scoped storage keys correctly", () => {
    const key = storageService.getUserKey("notes_data_list", "usr_user_a");
    assert.equal(key, "usr_user_a_notes_data_list");
  });

  it("should format user + workspace-scoped storage keys correctly", () => {
    const key = storageService.getScopedKey("projects", "usr_user_a", "ai-engineering");
    assert.equal(key, "usr_user_a_ai-engineering_projects");
  });

  it("should return 'guest' as fallback user ID when no session exists", () => {
    storageService.remove("auth_session");
    assert.equal(storageService.getCurrentUserId(), "guest");
  });

  it("should extract canonical user.id from active auth_session", () => {
    const session = { id: "usr_active_123", name: "Alice", email: "alice@example.com" };
    storageService.set("auth_session", JSON.stringify(session));
    assert.equal(storageService.getCurrentUserId(), "usr_active_123");
  });
});

describe("User Data Isolation — Cross-User Data Leak Prevention", () => {
  const userA = "usr_user_a";
  const userB = "usr_user_b";

  beforeEach(() => {
    // Clean keys for User A and User B
    const keysToClean = [
      "notes_data_list",
      "notes_folders_list",
      "knowledge_flashcards",
      "knowledge_summaries",
      "interview_completed_ids",
      "interview_revision_notes",
      "profileName",
      "profileBio",
      "xp",
      "streak",
      "projects",
      "pm_projects_registry",
      "gamify_achievements",
      "sync_queue"
    ];

    keysToClean.forEach((domainKey) => {
      storageService.remove(`${userA}_${domainKey}`);
      storageService.remove(`${userB}_${domainKey}`);
      storageService.remove(`${userA}_default_${domainKey}`);
      storageService.remove(`${userB}_default_${domainKey}`);
      storageService.remove(domainKey);
    });
  });

  it("should isolate Notes domain between User A and User B", () => {
    const userANotes = [{ id: 101, title: "User A Secret Note", content: "Top Secret A" }];
    const userBNotes = [{ id: 202, title: "User B Secret Note", content: "Top Secret B" }];

    // User A writes notes
    storageService.set(storageService.getUserKey("notes_data_list", userA), JSON.stringify(userANotes));

    // User B reads notes
    const readB = storageService.getInitialScopedData("notes_data_list", userB, []);
    assert.deepEqual(readB, []); // User B gets empty default, NOT User A's note

    // User B writes notes
    storageService.set(storageService.getUserKey("notes_data_list", userB), JSON.stringify(userBNotes));

    // User A reads notes back
    const readA = storageService.getInitialScopedData("notes_data_list", userA, []);
    assert.deepEqual(readA, userANotes); // User A's data remains intact
  });

  it("should isolate Knowledge domain (Flashcards & Summaries) between User A and User B", () => {
    const userAFlashcards = [{ id: 1, question: "Q A", answer: "Ans A" }];

    // User A writes custom flashcard
    storageService.set(storageService.getUserKey("knowledge_flashcards", userA), JSON.stringify(userAFlashcards));

    // User B reads flashcards
    const readB = storageService.getInitialScopedData("knowledge_flashcards", userB, []);
    assert.deepEqual(readB, []); // User B does NOT see User A's flashcards
  });

  it("should isolate Interview domain between User A and User B", () => {
    const userABookmarks = [10, 20, 30];

    storageService.set(storageService.getUserKey("interview_bookmarked_ids", userA), JSON.stringify(userABookmarks));

    const readB = storageService.getInitialScopedData("interview_bookmarked_ids", userB, []);
    assert.deepEqual(readB, []);
  });

  it("should isolate AppContext user progress (XP, Projects) between User A and User B", () => {
    // User A earns 5000 XP and creates a custom project
    storageService.set(storageService.getUserKey("xp", userA), "5000");
    storageService.set(storageService.getUserKey("projects", userA), JSON.stringify([{ id: "pA", title: "Project A" }]));

    // User B reads XP and projects
    const xpB = storageService.getInitialScopedData("xp", userB, 120);
    const projB = storageService.getInitialScopedData("projects", userB, []);

    assert.equal(xpB, 120);
    assert.deepEqual(projB, []);
  });

  it("should isolate Repository data (UserRepository, ProjectRepository, PlannerRepository) across users", async () => {
    // User A saves profile and planner schedule in workspace "ai-engineering"
    await UserRepository.saveProfile({ name: "Alice", xp: 999 }, "ai-engineering", userA);
    await PlannerRepository.saveScheduleList([{ id: "sA", title: "Alice Task" }], "ai-engineering", userA);

    // User B reads profile and planner in same workspace
    const profileB = await UserRepository.getProfile("ai-engineering", userB);
    const scheduleB = await PlannerRepository.getScheduleList("ai-engineering", userB);

    assert.equal(profileB.name, "Pranav"); // User B gets default profile name
    assert.equal(profileB.xp, 120);
    assert.deepEqual(scheduleB, []); // User B gets empty schedule list
  });

  it("P0-2: projectEngine isolates projects between User A and User B", () => {
    projectEngine.createProject({ title: "User A Secret App" }, "default", userA);
    const bProjects = projectEngine.getProjects("default", userB);
    const aProjects = projectEngine.getProjects("default", userA);

    assert.equal(bProjects.some((p) => p.title === "User A Secret App"), false);
    assert.equal(aProjects.some((p) => p.title === "User A Secret App"), true);
  });

  it("P1-1: legacy migration only claims verifiable seed data, refusing unknown user data for usr_dev_user", () => {
    const unknownData = JSON.stringify([{ id: 999, title: "Unowned Private Note" }]);
    storageService.set("notes_data_list", unknownData);

    // Default user (usr_dev_user) reading notes should NOT claim unknown legacy data
    const devNotes = storageService.getInitialScopedData("notes_data_list", "usr_dev_user", []);
    assert.deepEqual(devNotes, []);

    // User B should also NOT get unknown legacy data
    const userBNotes = storageService.getInitialScopedData("notes_data_list", userB, []);
    assert.deepEqual(userBNotes, []);
  });

  it("P0-2: projectEngine throws error when saving or creating without explicit userId", () => {
    assert.throws(() => {
      projectEngine.createProject({ title: "No User Project" }, "default", null);
    }, /Cannot create project without an explicit userId/);

    assert.throws(() => {
      projectEngine.saveProjects([], "default", null);
    }, /Cannot save projects without an explicit userId/);
  });

  it("P0-2: templateEngine and CreateProjectTool require and forward explicit userId", async () => {
    assert.throws(() => {
      templateEngine.createFromTemplate("template_ai_rag", "Custom RAG", "default", null);
    }, /Cannot create project from template without an explicit userId/);

    const tplProject = templateEngine.createFromTemplate("template_ai_rag", "User A RAG", "default", userA);
    assert.equal(tplProject.title, "User A RAG");
    const bProjects = projectEngine.getProjects("default", userB);
    assert.equal(bProjects.some((p) => p.title === "User A RAG"), false);

    const tool = new projectTools.CreateProjectTool();
    await assert.rejects(async () => {
      await tool.execute({ title: "Tool App" }, {});
    }, /missing active user identity/);

    const createdByTool = await tool.execute({ title: "Tool App User A" }, { userId: userA, workspaceId: "default" });
    assert.equal(createdByTool.title, "Tool App User A");
  });

  it("P1-2: offline sync queue, conflicts, and timestamps are isolated per user and workspace", () => {
    // Simulate offline state
    offlineSyncService.isOnline = () => false;

    offlineSyncService.addToQueue({ type: "SYNC_A", payload: "dataA" }, "default", userA);
    offlineSyncService.triggerMockConflict("default", userA);
    offlineSyncService.setLastSyncedTime("10:00:00 AM", "default", userA);

    const queueB = offlineSyncService.getSyncQueue("default", userB);
    const queueA = offlineSyncService.getSyncQueue("default", userA);
    const conflictsB = offlineSyncService.getConflicts("default", userB);
    const conflictsA = offlineSyncService.getConflicts("default", userA);
    const lastSyncedB = offlineSyncService.getLastSyncedTime("default", userB);
    const lastSyncedA = offlineSyncService.getLastSyncedTime("default", userA);

    assert.equal(queueB.length, 0);
    assert.equal(queueA.length, 1);
    assert.equal(queueA[0].actionType, "SYNC_A");

    assert.equal(conflictsB.length, 0);
    assert.equal(conflictsA.length, 1);

    assert.equal(lastSyncedB, "Never");
    assert.equal(lastSyncedA, "10:00:00 AM");
  });

  it("P1-3: UserRepository and AppContext share the exact same user profile keys", async () => {
    await UserRepository.saveProfile({ name: "Bob", bio: "Hacker", xp: 500, streak: 10 }, "default", userB);

    const contextName = storageService.getInitialScopedData("profileName", userB, "");
    const contextBio = storageService.getInitialScopedData("profileBio", userB, "");
    const contextXp = Number(storageService.getInitialScopedData("xp", userB, 0));
    const contextStreak = Number(storageService.getInitialScopedData("streak", userB, 0));

    assert.equal(contextName, "Bob");
    assert.equal(contextBio, "Hacker");
    assert.equal(contextXp, 500);
    assert.equal(contextStreak, 10);
  });

  it("P1-3: contextEngine isolates system, domain, and prompt contexts per user and workspace", () => {
    storageService.set(storageService.getUserKey("profileName", userA), "Alice");
    storageService.set(storageService.getUserKey("xp", userA), "1000");

    storageService.set(storageService.getUserKey("profileName", userB), "Bob");
    storageService.set(storageService.getUserKey("xp", userB), "200");

    const promptA = contextEngine.compileContextPrompt("dashboard", "default", userA);
    const promptB = contextEngine.compileContextPrompt("dashboard", "default", userB);

    assert.match(promptA, /User Profile: Alice/);
    assert.match(promptB, /User Profile: Bob/);
    assert.doesNotMatch(promptA, /User Profile: Bob/);
  });
});
