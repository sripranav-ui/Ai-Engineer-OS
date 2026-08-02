// =======================================================
// Layout.jsx — Global Application Shell & Desktop OS Container
// =======================================================

import React, { useContext } from "react";
import { useLocation } from "react-router-dom";
import DesktopLayout from "../Desktop/DesktopLayout.jsx";
import { ToastContainer } from "../Common/Toast";
import { NotificationContext } from "../../context/NotificationContext";

const AUTH_PATHS = ["/login", "/register", "/forgot-password"];

function Layout({ children }) {
  const location = useLocation();
  const isAuthPage = AUTH_PATHS.includes(location.pathname);
  const { toasts, removeToast } = useContext(NotificationContext);

  if (isAuthPage) {
    return (
      <div className="auth-layout font-sans bg-slate-950 text-slate-100 min-h-screen">
        {children}
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    );
  }

  return (
    <div className="app font-sans bg-slate-950 text-slate-100 min-h-screen overflow-hidden">
      <DesktopLayout>{children}</DesktopLayout>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default Layout;
