// =======================================================
// certificateEngine.js — Certificate Locker Engine
// =======================================================
// Manages earned certificates, issue dates, credential IDs,
// issuer organizations, and verification links.
// =======================================================

import storageService from "../storageService";

const CERTS_KEY = "career_certificates_locker";

const DEFAULT_CERTS = [
  { id: "cert_1", title: "Deep Learning Specialization", issuer: "DeepLearning.AI", issueDate: "2026-05-15", credentialId: "COURSERA-DL-9921", verified: true },
  { id: "cert_2", title: "AWS Certified Machine Learning - Specialty", issuer: "Amazon Web Services", issueDate: "2026-06-20", credentialId: "AWS-MLS-88310", verified: true },
];

export const certificateEngine = {
  /** Get all certificates */
  getCertificates: () => {
    try {
      const raw = storageService.get(CERTS_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_CERTS;
    } catch {
      return DEFAULT_CERTS;
    }
  },

  /** Add certificate */
  addCertificate: (certData) => {
    const list = certificateEngine.getCertificates();
    const newCert = {
      id: `cert_${Date.now()}`,
      title: certData.title || "Certification",
      issuer: certData.issuer || "Organization",
      issueDate: certData.issueDate || new Date().toISOString().split("T")[0],
      credentialId: certData.credentialId || `CRED-${Date.now()}`,
      verified: true,
    };
    const updated = [newCert, ...list];
    storageService.set(CERTS_KEY, JSON.stringify(updated));
    return newCert;
  },
};

export default certificateEngine;
