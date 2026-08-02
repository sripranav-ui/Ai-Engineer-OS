import React from "react";
import { Link } from "react-router-dom";
import LoginForm from "../components/Auth/LoginForm";

// =======================================================
// LoginPage.jsx — System Entry
// =======================================================

function LoginPage() {
  return (
    <div className="auth-card">
      <h1>Welcome Back</h1>
      <p>Sign in to continue your AI engineering journey</p>

      <LoginForm />

      <div className="auth-link">
        Don't have an account? <Link to="/register">Create Account</Link>
      </div>
    </div>
  );
}

export default React.memo(LoginPage);
