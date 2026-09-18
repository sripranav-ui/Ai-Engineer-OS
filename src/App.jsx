import React, { Suspense, useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import AuthorizationGuard from "./components/Auth/AuthorizationGuard";
import { PERMISSIONS } from "./services/auth/permissionDefinitions";

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

function UnauthorizedFallback({
  title = "Access Denied",
  message = "You do not have the required capability permission to access this route.",
}) {
  return (
    <div className="h-full w-full bg-[#050508] text-slate-100 p-8 flex flex-col items-center justify-center text-center font-sans">
      <div className="max-w-md p-6 rounded-2xl bg-[#0e0e14] border border-white/[0.08] shadow-xl space-y-4">
        <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-xl font-bold">
          🔒
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
        <p className="text-xs text-slate-400 leading-relaxed">{message}</p>
      </div>
    </div>
  );
}

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
              <Route
                path="/"
                element={
                  <AuthorizationGuard permission={PERMISSIONS.USE_AI_ASSISTANT} fallback={<UnauthorizedFallback />}>
                    <Suspense fallback={<PageSkeleton />}>
                      <AssistantPage />
                    </Suspense>
                  </AuthorizationGuard>
                }
              />
              <Route path="/assistant" element={<Navigate to="/" replace />} />
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              <Route path="/workspace" element={<Navigate to="/" replace />} />
              <Route path="/chat" element={<Navigate to="/" replace />} />
              <Route path="/tasks" element={<Navigate to="/planner" replace />} />

              {/* Core Feature Pages */}
              <Route
                path="/coding-workspace"
                element={
                  <AuthorizationGuard permission={PERMISSIONS.ACCESS_CODING_STUDIO} fallback={<UnauthorizedFallback />}>
                    <Suspense fallback={<PageSkeleton />}>
                      <CodingWorkspacePage />
                    </Suspense>
                  </AuthorizationGuard>
                }
              />
              <Route
                path="/knowledge"
                element={
                  <AuthorizationGuard permission={PERMISSIONS.ACCESS_KNOWLEDGE} fallback={<UnauthorizedFallback />}>
                    <Suspense fallback={<PageSkeleton />}>
                      <KnowledgeHubPage />
                    </Suspense>
                  </AuthorizationGuard>
                }
              />
              <Route path="/projects" element={<Suspense fallback={<PageSkeleton />}><ProjectsPage /></Suspense>} />
              <Route
                path="/planner"
                element={
                  <AuthorizationGuard permission={PERMISSIONS.ACCESS_PLANNER} fallback={<UnauthorizedFallback />}>
                    <Suspense fallback={<PageSkeleton />}>
                      <PlannerPage />
                    </Suspense>
                  </AuthorizationGuard>
                }
              />
              <Route
                path="/notes"
                element={
                  <AuthorizationGuard permission={PERMISSIONS.ACCESS_NOTES} fallback={<UnauthorizedFallback />}>
                    <Suspense fallback={<PageSkeleton />}>
                      <NotesPage />
                    </Suspense>
                  </AuthorizationGuard>
                }
              />
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