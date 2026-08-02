import React, { createContext, useState, useEffect, useMemo, useCallback } from "react";
import resumeEngine from "../services/career/resumeEngine";
import portfolioEngine from "../services/career/portfolioEngine";
import applicationEngine from "../services/career/applicationEngine";
import companyEngine from "../services/career/companyEngine";
import interviewEngine from "../services/career/interviewEngine";
import aiInterviewCoach from "../services/career/aiInterviewCoach";
import skillGapEngine from "../services/career/skillGapEngine";
import certificateEngine from "../services/career/certificateEngine";
import careerAnalyticsEngine from "../services/career/careerAnalyticsEngine";
import aiCareerAssistant from "../services/career/aiCareerAssistant";

// =======================================================
// CareerContext.jsx — Guarded State Initialization
// =======================================================

export const CareerContext = createContext(null);

export function CareerProvider({ children }) {
  const [resumes, setResumes]           = useState(() => Array.isArray(resumeEngine.getResumes()) ? resumeEngine.getResumes() : []);
  const [portfolio, setPortfolio]       = useState(() => portfolioEngine.getPortfolio() || { skills: [] });
  const [applications, setApplications] = useState(() => Array.isArray(applicationEngine.getApplications()) ? applicationEngine.getApplications() : []);
  const [companies, setCompanies]       = useState(() => Array.isArray(companyEngine.getCompanies()) ? companyEngine.getCompanies() : []);
  const [certs, setCerts]               = useState(() => Array.isArray(certificateEngine.getCertificates()) ? certificateEngine.getCertificates() : []);
  const [salaryGoal, setSalaryGoal]     = useState(() => {
    const saved = localStorage.getItem("career_salary_goal");
    return saved ? Number(saved) || 115000 : 115000;
  });

  useEffect(() => {
    localStorage.setItem("career_salary_goal", salaryGoal);
  }, [salaryGoal]);

  const addResume = useCallback((name, version) => {
    const newRes = resumeEngine.createResume({ title: name, version });
    setResumes(Array.isArray(resumeEngine.getResumes()) ? resumeEngine.getResumes() : []);
    return newRes;
  }, []);

  const setActiveResume = useCallback((id) => {
    const updated = resumeEngine.setActive(id);
    setResumes(Array.isArray(updated) ? updated : []);
  }, []);

  const addApplication = useCallback((role, company, location, salary) => {
    const newApp = applicationEngine.addApplication({ role, company, location, salary });
    setApplications(Array.isArray(applicationEngine.getApplications()) ? applicationEngine.getApplications() : []);
    return newApp;
  }, []);

  const updateApplicationStatus = useCallback((id, status) => {
    const updated = applicationEngine.updateStatus(id, status);
    setApplications(Array.isArray(updated) ? updated : []);
  }, []);

  const addDreamCompany = useCallback((name, role, targetDate) => {
    const newComp = companyEngine.addCompany({ name, role, targetDate });
    setCompanies(Array.isArray(companyEngine.getCompanies()) ? companyEngine.getCompanies() : []);
    return newComp;
  }, []);

  const addCertificate = useCallback((title, issuer) => {
    const newCert = certificateEngine.addCertificate({ title, issuer });
    setCerts(Array.isArray(certificateEngine.getCertificates()) ? certificateEngine.getCertificates() : []);
    return newCert;
  }, []);

  const safeResumes = Array.isArray(resumes) ? resumes : [];
  const safePortfolio = portfolio && typeof portfolio === "object" ? portfolio : { skills: [] };
  const safeSkills = Array.isArray(safePortfolio.skills) ? safePortfolio.skills : [];

  const value = useMemo(
    () => ({
      salaryGoal,
      setSalaryGoal,
      resumes: safeResumes,
      activeResume: safeResumes.find((r) => r && r.active) || safeResumes[0] || null,
      addResume,
      setActiveResume,
      portfolio: safePortfolio,
      savePortfolio: (data) => setPortfolio(portfolioEngine.savePortfolio(data)),
      applications: Array.isArray(applications) ? applications : [],
      addApplication,
      updateApplicationStatus,
      companies: Array.isArray(companies) ? companies : [],
      addDreamCompany,
      questionBank: interviewEngine.getQuestionBank(),
      mockHistory: interviewEngine.getMockHistory(),
      saveMockAttempt: (data) => interviewEngine.saveMockAttempt(data),
      evaluateInterviewResponse: aiInterviewCoach.evaluateResponse,
      skillGap: skillGapEngine.analyzeGap("AI Specialist", safeSkills),
      certificates: Array.isArray(certs) ? certs : [],
      addCertificate,
      analytics: careerAnalyticsEngine.getMetrics(),
      aiAssistant: aiCareerAssistant,
    }),
    [salaryGoal, safeResumes, safePortfolio, safeSkills, applications, companies, certs, addResume, setActiveResume, addApplication, updateApplicationStatus, addDreamCompany, addCertificate]
  );

  return <CareerContext.Provider value={value}>{children}</CareerContext.Provider>;
}

export function useCareer() {
  const ctx = React.useContext(CareerContext);
  if (!ctx) throw new Error("useCareer must be used inside <CareerProvider>");
  return ctx;
}

export default CareerContext;
