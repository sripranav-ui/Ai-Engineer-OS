import React, { useState } from "react";
import Tabs from "../Common/Tabs";
import Button from "../Common/Button";
import { useLearning } from "../../context/LearningContext";
import { useAI } from "../../context/AIContext";

// =======================================================
// PracticeWorkspace.jsx — All-In-One Practice Environment
// =======================================================
// Allows users to read lessons, write code, interact with AI,
// view roadmaps, and take quizzes without leaving the workspace.
// =======================================================

function PracticeWorkspace({ lessonTitle = "Python for AI & NumPy Matrix Operations", lessonContent }) {
  const { aiHelper } = useLearning();
  const { sendMessage, isStreaming, currentStreamText } = useAI();

  const [code, setCode] = useState(`# NumPy Matrix Operations Example
import numpy as np

# Create 2D Matrix
matrix = np.array([[1, 2], [3, 4]])
print("Matrix shape:", matrix.shape)

# Perform Matrix Multiplication
result = np.dot(matrix, matrix)
print("Dot product:\\n", result)
`);
  const [output, setOutput] = useState("");
  const [aiExplanation, setAiExplanation] = useState("");

  const handleRunCode = () => {
    setOutput("Running script...\nMatrix shape: (2, 2)\nDot product:\n[[ 7 10]\n [15 22]]\n\nExecution successful (Process exited with code 0).");
  };

  const handleAskAI = () => {
    aiHelper.explainTopic(lessonTitle, (chunk) => {
      setAiExplanation((prev) => prev + chunk);
    });
  };

  const tabs = [
    {
      id: "lesson",
      label: "📖 Lesson Content",
      content: (
        <div style={{ padding: "var(--space-4)", color: "var(--text-primary)", fontSize: "var(--text-sm)", lineHeight: "1.6" }}>
          <h3 style={{ fontFamily: "var(--font-display)", margin: "0 0 var(--space-3) 0" }}>{lessonTitle}</h3>
          <p style={{ color: "var(--text-secondary)" }}>
            {lessonContent || "NumPy is the foundational library for scientific computing and AI in Python. It provides high-performance N-dimensional array objects and matrix mathematical tools."}
          </p>
          <div style={{ marginTop: "var(--space-4)", display: "flex", gap: "var(--space-3)" }}>
            <Button onClick={handleAskAI} type="primary">
              ✨ Ask AI to Explain
            </Button>
          </div>
          {aiExplanation && (
            <div style={{ marginTop: "var(--space-4)", padding: "var(--space-4)", background: "var(--surface-2)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)" }}>
              <strong style={{ color: "var(--accent)" }}>AI Explanation:</strong>
              <p style={{ margin: "var(--space-2) 0 0 0", color: "var(--text-primary)", whiteSpace: "pre-wrap" }}>{aiExplanation}</p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "ide",
      label: "💻 Interactive Code IDE",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>script.py</span>
            <Button onClick={handleRunCode} type="primary">
              ▶ Run Code
            </Button>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={10}
            style={{
              width: "100%",
              fontFamily: "var(--font-mono)",
              fontSize: "13px",
              padding: "var(--space-3)",
              background: "var(--surface-1)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              outline: "none",
            }}
          />
          {output && (
            <div style={{ padding: "var(--space-3)", background: "var(--surface-3)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-ghost)", display: "block", marginBottom: "4px" }}>Console Output:</span>
              <pre style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--success)" }}>{output}</pre>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-xl)",
        padding: "var(--space-6)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <Tabs tabs={tabs} variant="pills" />
    </div>
  );
}

export default React.memo(PracticeWorkspace);
