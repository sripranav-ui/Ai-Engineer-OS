import React from "react";
import AssistantPage from "../../pages/AssistantPage.jsx";
import CodingWorkspacePage from "../../pages/CodingWorkspacePage.jsx";
import KnowledgeHubPage from "../../pages/KnowledgeHubPage.jsx";
import ProjectsPage from "../../pages/ProjectsPage.jsx";
import PlannerPage from "../../pages/PlannerPage.jsx";
import NotesPage from "../../pages/NotesPage.jsx";
import SettingsPanelWindow from "../SettingsPanel/SettingsPanelWindow.jsx";
import AnalyticsPage from "../../pages/AnalyticsPage.jsx";

export function DesktopMainWorkspace({ activeTab, children }) {
  return (
    <div className="flex-1 h-full w-full bg-[#050508] overflow-hidden relative">
      {children || (
        <>
          {(activeTab === "assistant" || activeTab === "chat" || activeTab === "dashboard") && <AssistantPage />}
          {(activeTab === "studio" || activeTab === "coding") && <CodingWorkspacePage />}
          {(activeTab === "knowledge" || activeTab === "graph") && <KnowledgeHubPage />}
          {activeTab === "projects" && <ProjectsPage />}
          {(activeTab === "planner" || activeTab === "tasks") && <PlannerPage />}
          {activeTab === "notes" && <NotesPage />}
          {activeTab === "settings" && <SettingsPanelWindow />}
          {activeTab === "analytics" && <AnalyticsPage />}
        </>
      )}
    </div>
  );
}

export default React.memo(DesktopMainWorkspace);
