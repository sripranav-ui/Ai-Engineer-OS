import React, { Suspense } from "react";
import { PageSkeleton } from "../Common/Skeleton.jsx";

const DashboardPage = React.lazy(() => import("../../pages/DashboardPage.jsx"));
const AssistantPage = React.lazy(() => import("../../pages/AssistantPage.jsx"));
const CodingWorkspacePage = React.lazy(() => import("../../pages/CodingWorkspacePage.jsx"));
const KnowledgeHubPage = React.lazy(() => import("../../pages/KnowledgeHubPage.jsx"));
const ProjectsPage = React.lazy(() => import("../../pages/ProjectsPage.jsx"));
const PlannerPage = React.lazy(() => import("../../pages/PlannerPage.jsx"));
const NotesPage = React.lazy(() => import("../../pages/NotesPage.jsx"));
const SettingsPanelWindow = React.lazy(() => import("../SettingsPanel/SettingsPanelWindow.jsx"));
const AnalyticsPage = React.lazy(() => import("../../pages/AnalyticsPage.jsx"));

export function DesktopMainWorkspace({ activeTab, children }) {
  return (
    <div className="flex-1 h-full w-full bg-[#050508] overflow-hidden relative">
      {children || (
        <Suspense fallback={<PageSkeleton />}>
          {(activeTab === "dashboard" || activeTab === "workspace") && <DashboardPage />}
          {(activeTab === "assistant" || activeTab === "chat") && <AssistantPage />}
          {(activeTab === "studio" || activeTab === "coding") && <CodingWorkspacePage />}
          {(activeTab === "knowledge" || activeTab === "graph") && <KnowledgeHubPage />}
          {activeTab === "projects" && <ProjectsPage />}
          {(activeTab === "planner" || activeTab === "tasks") && <PlannerPage />}
          {activeTab === "notes" && <NotesPage />}
          {activeTab === "settings" && <SettingsPanelWindow />}
          {activeTab === "analytics" && <AnalyticsPage />}
        </Suspense>
      )}
    </div>
  );
}

export default React.memo(DesktopMainWorkspace);
