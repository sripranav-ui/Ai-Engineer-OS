import React, { Suspense, useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

// Layout
import Layout from "./components/Layout/Layout";

// Skeleton Loaders
import { PageSkeleton, DashboardSkeleton } from "./components/Common/Skeleton";

// Route-Level Lazy-Loaded Pages for Production Bundle Optimization
const LearningPage = React.lazy(() => import("./pages/LearningPage"));
const RoadmapPage = React.lazy(() => import("./pages/RoadmapPage"));
const ProjectsPage = React.lazy(() => import("./pages/ProjectsPage"));
const CertificatesPage = React.lazy(() => import("./pages/CertificatesPage"));
const SettingsPage = React.lazy(() => import("./pages/SettingsPage"));
const AnalyticsPage = React.lazy(() => import("./pages/AnalyticsPage"));
const PlannerPage = React.lazy(() => import("./pages/PlannerPage"));
const AssistantPage = React.lazy(() => import("./pages/AssistantPage"));
const PlacementPage = React.lazy(() => import("./pages/PlacementPage"));

// Auth & Standalone Pages
const LoginPage = React.lazy(() => import("./pages/LoginPage"));
const RegisterPage = React.lazy(() => import("./pages/RegisterPage"));
const ForgotPassword = React.lazy(() => import("./pages/ForgotPassword"));
const ProfilePage = React.lazy(() => import("./pages/ProfilePage"));
const GamificationPage = React.lazy(() => import("./pages/GamificationPage"));
const ResumeBuilderPage = React.lazy(() => import("./pages/ResumeBuilderPage"));
const InterviewPrepPage = React.lazy(() => import("./pages/InterviewPrepPage"));
const NotesPage = React.lazy(() => import("./pages/NotesPage"));
const NotFoundPage = React.lazy(() => import("./pages/NotFoundPage"));
const PortfolioHubPage = React.lazy(() => import("./pages/PortfolioHubPage"));
const KnowledgeHubPage = React.lazy(() => import("./pages/KnowledgeHubPage"));
const CommunityPage = React.lazy(() => import("./pages/CommunityPage"));
const CodingWorkspacePage = React.lazy(() => import("./pages/CodingWorkspacePage"));
const CareerCoachPage = React.lazy(() => import("./pages/CareerCoachPage"));
const PluginsPage = React.lazy(() => import("./pages/PluginsPage"));

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