// =======================================================
// noteTools.js — Concrete Workspace Notes Tools
// =======================================================

import BaseTool from "../base/baseTool.js";
import { PERMISSION_SCOPES } from "../runtime/permissionManager.js";
import storageService from "../../../storageService.js";

export class SearchNotesTool extends BaseTool {
  constructor() {
    super({
      id: "search_notes",
      name: "Search Notes Tool",
      description: "Searches through workspace Markdown notes by query string.",
      category: "Notes",
      permissions: [PERMISSION_SCOPES.READ_NOTES],
    });
  }

  async execute(args) {
    const userId = storageService.getCurrentUserId();
    const notesKey = storageService.getUserKey("notes_data_list", userId);
    const legacyKey = storageService.getUserKey("knowledge_notes", userId);
    const raw = storageService.get(notesKey) || storageService.get(legacyKey);
    const notes = raw ? JSON.parse(raw) : [];
    const query = (args.query || "").toLowerCase();

    return notes.filter(
      (n) => n.title.toLowerCase().includes(query) || n.content.toLowerCase().includes(query)
    );
  }
}

export default { SearchNotesTool };
