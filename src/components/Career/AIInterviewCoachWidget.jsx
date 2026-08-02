import React, { useState } from "react";
import Button from "../Common/Button";
import FormControls from "../Common/FormControls";
import { useCareer } from "../../context/CareerContext";

// =======================================================
// AIInterviewCoachWidget.jsx — Interactive AI Interview Coach
// =======================================================
// Interactive mock interview evaluator where user answers
// technical or STAR questions and receives real-time AI feedback.
// =======================================================

function AIInterviewCoachWidget({ defaultQuestion = "Tell me about a time you resolved a difficult technical disagreement on model architecture." }) {
  const { evaluateInterviewResponse } = useCareer();
  const [question, setQuestion]         = useState(defaultQuestion);
  const [userResponse, setUserResponse] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback]         = useState("");

  const handleEvaluate = async () => {
    if (!userResponse.trim() || isEvaluating) return;
    setIsEvaluating(true);
    setFeedback("");

    await evaluateInterviewResponse(
      { questionTitle: question, userResponse, category: "Behavioral" },
      (chunk) => {
        setFeedback((prev) => prev + chunk);
      }
    );

    setIsEvaluating(false);
  };

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
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-4)" }}>
        <span style={{ fontSize: "20px" }}>🎙️</span>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-md)", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
          AI Real-Time Mock Interview Coach
        </h3>
      </div>

      {/* Question Selector / Box */}
      <div style={{ padding: "var(--space-4)", background: "var(--surface-2)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", marginBottom: "var(--space-4)" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--accent)", fontWeight: "700", display: "block", marginBottom: "4px" }}>
          INTERVIEW QUESTION:
        </span>
        <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>{question}</p>
      </div>

      {/* Answer Textarea */}
      <div style={{ marginBottom: "var(--space-4)" }}>
        <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
          Your STAR / Technical Answer:
        </label>
        <textarea
          rows={5}
          placeholder="Describe Situation, Task, Action you took, and quantifiable Result..."
          value={userResponse}
          onChange={(e) => setUserResponse(e.target.value)}
          style={{
            width: "100%",
            padding: "var(--space-3)",
            background: "var(--surface-1)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)",
            fontSize: "13.5px",
            outline: "none",
            resize: "vertical",
          }}
        />
      </div>

      <Button onClick={handleEvaluate} type="primary" disabled={isEvaluating || !userResponse.trim()}>
        {isEvaluating ? "✨ AI Coach Analyzing Response..." : "Evaluate Answer with AI"}
      </Button>

      {/* Real-time Feedback Stream */}
      {feedback && (
        <div style={{ marginTop: "var(--space-6)", padding: "var(--space-5)", background: "var(--surface-2)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-default)" }}>
          <h4 style={{ fontFamily: "var(--font-display)", fontSize: "14px", fontWeight: "700", color: "var(--success)", margin: "0 0 var(--space-3) 0" }}>
            📊 AI Coach Evaluation & STAR Analysis:
          </h4>
          <div style={{ fontSize: "13.5px", color: "var(--text-primary)", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
            {feedback}
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(AIInterviewCoachWidget);
