import React from "react";
import { Link } from "react-router-dom";
import RegisterForm from "../components/Auth/RegisterForm";

// =======================================================
// RegisterPage.jsx — New Account
// =======================================================

function RegisterPage() {
  return (
    <div className="auth-card">
      <h1>Join AI Engineer OS</h1>
      <p>Create an account to begin your engineering journey</p>

      <RegisterForm />

      <div className="auth-link">
        Already have an account? <Link to="/login">Sign In</Link>
      </div>
    </div>
  );
}

export default React.memo(RegisterPage);
