import React, { useContext, useEffect, useMemo } from "react";
import AppContext from "../context/AppContext";
import Card from "../components/Common/Card";
import Button from "../components/Common/Button";
import Badge from "../components/Common/Badge";
import useDocumentMetadata from "../hooks/useDocumentMetadata";

// =======================================================
// CertificatesPage.jsx — Trophy Case
// Earned credentials from roadmap milestones.
// =======================================================

function CertificatesPage() {
  const { roadmap, certificates, setCertificates } = useContext(AppContext);
  useDocumentMetadata("Certificates", "View and download your earned credentials.");

  const earnedCertificates = useMemo(() => {
    const completedDays = roadmap.filter((day) => day.completed).map((d) => d.id);
    const certList = [];

    const hasBasics = [1, 2, 3].every(id => completedDays.includes(id));
    certList.push({
      id: "python-basics",
      title: "Python Foundations",
      description: "Demonstrated proficiency in Python variables, data types, and basic operators.",
      earned: hasBasics,
      milestone: "Complete Days 1–3",
      code: "AIE-PY-FND-2026",
    });

    const hasStructures = [4, 5, 6, 7].every(id => completedDays.includes(id));
    certList.push({
      id: "python-structures",
      title: "Advanced Data Structures",
      description: "Demonstrated competency in conditional logic, loops, functions, lists, and tuples.",
      earned: hasStructures,
      milestone: "Complete Days 4–7",
      code: "AIE-PY-STR-2026",
    });

    const hasMastery = roadmap.length > 0 && roadmap.every(day => day.completed);
    certList.push({
      id: "ai-engineer-mastery",
      title: "AI Engineer CLI Developer",
      description: "Completed the entire foundational roadmap and built a CLI mini project.",
      earned: hasMastery,
      milestone: "Complete All 10 Days",
      code: "AIE-PY-MST-2026",
    });

    return certList;
  }, [roadmap]);

  const totalEarnedCount = useMemo(() => earnedCertificates.filter(c => c.earned).length, [earnedCertificates]);

  useEffect(() => {
    if (certificates !== totalEarnedCount) setCertificates(totalEarnedCount);
  }, [totalEarnedCount, certificates, setCertificates]);

  const handleDownload = (certTitle, code) => {
    const docText = `=======================================================
               CERTIFICATE OF COMPLETION
=======================================================

This is to verify that the student has completed the
requirements for:

          ${certTitle.toUpperCase()}

Verification Code: ${code}
Issued on: ${new Date().toLocaleDateString()}
Platform: AI Engineer OS

Congratulations! Keep learning and building.
=======================================================`;

    const blob = new Blob([docText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${certTitle.toLowerCase().replace(/\s+/g, "_")}.txt`;
    link.click();
  };

  return (
    <div className="page-shell fade-in">
      {/* Header */}
      <div className="page-title-block">
        <h1>Certificates</h1>
        <p>View and download earned credentials. Complete milestones to unlock more.</p>
      </div>

      {/* Status Bar */}
      <Card className="spacer-md">
        <div className="row-between">
          <div>
            <div className="text-base font-bold text-primary">Credential Status</div>
            <div className="text-xs text-tertiary">Complete daily curriculum tasks to unlock certificates.</div>
          </div>
          <div className="row">
            <span className="text-xs text-ghost">Earned:</span>
            <Badge type="success">{totalEarnedCount} / {earnedCertificates.length}</Badge>
          </div>
        </div>
      </Card>

      {/* Certificates Grid */}
      <div className="certificates-grid">
        {earnedCertificates.map((cert) => (
          <div
            key={cert.id}
            className={`certificate-card ${cert.earned ? "earned" : ""}`}
            style={{
              borderColor: cert.earned ? "rgba(52, 211, 153, 0.2)" : undefined,
              opacity: cert.earned ? 1 : 0.6,
            }}
          >
            <div className="certificate-icon">{cert.earned ? "🏆" : "🔒"}</div>
            <div className="certificate-title">{cert.title}</div>
            <p className="text-sm text-tertiary" style={{ lineHeight: 1.55, margin: "var(--space-2) 0 var(--space-4)" }}>
              {cert.earned ? cert.description : `Locked. To unlock: ${cert.milestone}.`}
            </p>

            <div className="row-between" style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "var(--space-3)" }}>
              {cert.earned ? (
                <>
                  <span className="text-2xs text-ghost text-mono">ID: {cert.code}</span>
                  <Button onClick={() => handleDownload(cert.title, cert.code)} type="success">
                    Download
                  </Button>
                </>
              ) : (
                <>
                  <span className="text-xs text-danger font-semibold">{cert.milestone}</span>
                  <Button disabled type="ghost">Locked</Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default React.memo(CertificatesPage);