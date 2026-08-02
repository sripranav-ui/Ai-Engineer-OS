import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/base/variables.css";
import "./styles/base/reset.css";
import "./styles/base/typography.css";
import "./index.css";

import "./styles/components/button.css";
import "./styles/components/card.css";
import "./styles/components/badge.css";
import "./styles/components/avatar.css";
import "./styles/components/input.css";
import "./styles/components/modal.css";
import "./styles/components/loader.css";
import "./styles/components/empty-state.css";
import "./styles/components/sidebar.css";
import "./styles/components/dashboard-card.css";
import "./styles/components/progress-bar.css";
import "./styles/components/auth.css";
import "./styles/pages/community.css";
import "./styles/pages/coding-workspace.css";
import "./styles/pages/career-coach.css";
import "./styles/pages/pages.css";
import "./styles/base/transitions.css";
import "./styles/components/library.css";
import "./styles/components/ui-infrastructure.css";

import App from "./App";
import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";
import { GamificationProvider } from "./context/GamificationContext";
import { CareerProvider } from "./context/CareerContext";
import { InterviewProvider } from "./context/InterviewContext";
import { NotesProvider } from "./context/NotesContext";
import { KnowledgeProvider } from "./context/KnowledgeContext";
import { WorkspaceManagerProvider } from "./context/WorkspaceManagerContext";
import { ThemeProvider } from "./context/ThemeContext";
import { NotificationProvider } from "./context/NotificationContext";
import { DashboardProvider } from "./context/DashboardContext";
import { ProjectsProvider } from "./context/ProjectsContext";
import { PlannerProvider } from "./context/PlannerContext";
import { AnalyticsProvider } from "./context/AnalyticsContext";
import { WorkspaceProvider } from "./context/WorkspaceContext";
import { UIProvider } from "./context/UIContext";
import { AIProvider } from "./context/AIContext";
import { AIMemoryProvider } from "./context/AIMemoryContext";
import { LearningProvider } from "./context/LearningContext";
import { PluginsProvider } from "./context/PluginsContext";

const combineProviders = (...providers) => {
  return providers.reduce(
    (Combined, Provider) =>
      ({ children }) => (
        <Combined>
          <Provider>{children}</Provider>
        </Combined>
      ),
    ({ children }) => <>{children}</>
  );
};

const AppProviders = combineProviders(
  AuthProvider,
  WorkspaceManagerProvider,
  ThemeProvider,
  NotificationProvider,
  UIProvider,
  AIProvider,
  AIMemoryProvider,
  PluginsProvider,
  LearningProvider,
  DashboardProvider,
  ProjectsProvider,
  PlannerProvider,
  AnalyticsProvider,
  WorkspaceProvider,
  AppProvider,
  GamificationProvider,
  CareerProvider,
  InterviewProvider,
  NotesProvider,
  KnowledgeProvider
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>
);