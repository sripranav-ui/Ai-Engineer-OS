import React, { Suspense, useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

// Layout
import Layout from "./components/Layout/Layout";

// Skeleton Loaders
import { PageSkeleton, DashboardSkeleton } from "./components/Common/Skeleton";

// Direct Page Imports
import LearningPage from "./pages/LearningPage";
import RoadmapPage from "./pages/RoadmapPage";
import ProjectsPage from "./pages/ProjectsPage";
import CertificatesPage from "./pages/CertificatesPage";
import SettingsPage from "./pages/SettingsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import PlannerPage from "./pages/PlannerPage";
import AssistantPage from "./pages/AssistantPage";
import PlacementPage from "./pages/PlacementPage";

// Auth & Standalone Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPassword from "./pages/ForgotPassword";
import ProfilePage from "./pages/ProfilePage";
import GamificationPage from "./pages/GamificationPage";
import ResumeBuilderPage from "./pages/ResumeBuilderPage";
import InterviewPrepPage from "./pages/InterviewPrepPage";
import NotesPage from "./pages/NotesPage";
import NotFoundPage from "./pages/NotFoundPage";
import PortfolioHubPage from "./pages/PortfolioHubPage";
import KnowledgeHubPage from "./pages/KnowledgeHubPage";
import CommunityPage from "./pages/CommunityPage";
import CodingWorkspacePage from "./pages/CodingWorkspacePage";
import CareerCoachPage from "./pages/CareerCoachPage";
import PluginsPage from "./pages/PluginsPage";

import ErrorBoundary from "./components/Common/ErrorBoundary";

// =======================================================
// App.jsx — Conversational AI-First Operating System Routing
// =======================================================

function ProtectedRoutesWrapper() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function AuthRoutesWrapper() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Layout>
          <Routes>
            {/* Guest/Auth Form Portals */}
            <Route element={<AuthRoutesWrapper />}>
              <Route path="/login" element={<Suspense fallback={<PageSkeleton />}><LoginPage /></Suspense>} />
              <Route path="/register" element={<Suspense fallback={<PageSkeleton />}><RegisterPage /></Suspense>} />
              <Route path="/forgot-password" element={<Suspense fallback={<PageSkeleton />}><ForgotPassword /></Suspense>} />
            </Route>

            {/* Protected Application Routes */}
            <Route element={<ProtectedRoutesWrapper />}>
              {/* Home Page: Conversational AI Assistant Canvas */}
              <Route path="/" element={<Suspense fallback={<PageSkeleton />}><AssistantPage /></Suspense>} />
              <Route path="/assistant" element={<Navigate to="/" replace />} />
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              <Route path="/workspace" element={<Navigate to="/" replace />} />
              <Route path="/chat" element={<Navigate to="/" replace />} />
              <Route path="/tasks" element={<Navigate to="/planner" replace />} />

              {/* Core Feature Pages */}
              <Route path="/coding-workspace" element={<Suspense fallback={<PageSkeleton />}><CodingWorkspacePage /></Suspense>} />
              <Route path="/knowledge" element={<Suspense fallback={<PageSkeleton />}><KnowledgeHubPage /></Suspense>} />
              <Route path="/projects" element={<Suspense fallback={<PageSkeleton />}><ProjectsPage /></Suspense>} />
              <Route path="/planner" element={<Suspense fallback={<PageSkeleton />}><PlannerPage /></Suspense>} />
              <Route path="/notes" element={<Suspense fallback={<PageSkeleton />}><NotesPage /></Suspense>} />
              <Route path="/settings" element={<Suspense fallback={<PageSkeleton />}><SettingsPage /></Suspense>} />
              <Route path="/analytics" element={<Suspense fallback={<PageSkeleton />}><AnalyticsPage /></Suspense>} />
              <Route path="/profile" element={<Suspense fallback={<PageSkeleton />}><ProfilePage /></Suspense>} />
            </Route>

            {/* Fallbacks */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;