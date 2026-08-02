// =======================================================
// skillGapEngine.js — AI Skill Gap Analysis Engine
// =======================================================
// Compares user skills vs target role requirements to identify
// missing skills and generate concrete study & project plans.
// =======================================================

import storageService from "../storageService";

export const ROLE_REQUIREMENTS = {
  "AI Specialist": ["Python", "PyTorch", "Transformers", "RAG", "FastAPI", "Docker", "Vector DBs"],
  "ML Engineer":   ["Python", "Scikit-Learn", "PyTorch", "Docker", "SQL", "MLOps", "MLflow"],
  "Data Scientist":["Python", "Pandas", "NumPy", "Scikit-Learn", "SQL", "Data Visualization", "Statistics"],
};

export const skillGapEngine = {
  /** Perform skill gap analysis for target role */
  analyzeGap: (targetRole = "AI Specialist", currentSkills = ["Python", "PyTorch", "React"]) => {
    const required = ROLE_REQUIREMENTS[targetRole] || ROLE_REQUIREMENTS["AI Specialist"];
    const currentSet = new Set(currentSkills.map((s) => s.toLowerCase()));

    const acquired = [];
    const missing  = [];

    required.forEach((skill) => {
      if (currentSet.has(skill.toLowerCase())) {
        acquired.push(skill);
      } else {
        missing.push(skill);
      }
    });

    const matchPct = Math.round((acquired.length / required.length) * 100);

    return {
      targetRole,
      matchPct,
      acquiredSkills: acquired,
      missingSkills: missing,
      recommendation: missing.length > 0 ? `Focus on learning ${missing.slice(0, 2).join(" & ")} to boost match rate above 90%.` : "Target role requirements fully satisfied!",
    };
  },
};

export default skillGapEngine;
