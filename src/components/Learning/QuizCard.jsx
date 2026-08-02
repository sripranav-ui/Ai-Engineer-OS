import { useState, useEffect } from "react";
import Card from "../Common/Card";
import Button from "../Common/Button";

function QuizCard({ quizData }) {
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Reset quiz state when active lesson changes
  useEffect(() => {
    setUserAnswers({});
    setSubmitted(false);
    setScore(0);
  }, [quizData]);

  if (!quizData || quizData.length === 0) return null;

  const handleSelect = (qIdx, optIdx) => {
    if (submitted) return;
    setUserAnswers({
      ...userAnswers,
      [qIdx]: optIdx,
    });
  };

  const handleSubmit = () => {
    if (submitted) return;
    let correctCount = 0;
    quizData.forEach((q, idx) => {
      if (userAnswers[idx] === q.answerIndex) {
        correctCount += 1;
      }
    });
    setScore(correctCount);
    setSubmitted(true);
  };

  return (
    <Card title="✏️ Lesson Quiz" style={{ marginTop: "25px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "15px" }}>
        {quizData.map((q, qIdx) => (
          <div key={qIdx} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <h4 style={{ color: "#ffffff", margin: 0, fontSize: "15px" }}>
              {qIdx + 1}. {q.question}
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {q.options.map((opt, optIdx) => {
                const isSelected = userAnswers[qIdx] === optIdx;
                const isCorrect = q.answerIndex === optIdx;

                let btnBackground = "rgba(255, 255, 255, 0.02)";
                let btnBorderColor = "rgba(255, 255, 255, 0.05)";
                let btnTextColor = "#cbd5e1";

                if (isSelected) {
                  btnBackground = "rgba(59, 130, 246, 0.15)";
                  btnBorderColor = "#3b82f6";
                  btnTextColor = "#60a5fa";
                }

                if (submitted) {
                  if (isCorrect) {
                    btnBackground = "rgba(34, 197, 94, 0.15)";
                    btnBorderColor = "#22c55e";
                    btnTextColor = "#4ade80";
                  } else if (isSelected) {
                    btnBackground = "rgba(239, 68, 68, 0.15)";
                    btnBorderColor = "#ef4444";
                    btnTextColor = "#f87171";
                  }
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelect(qIdx, optIdx)}
                    disabled={submitted}
                    style={{
                      padding: "12px 16px",
                      borderRadius: "8px",
                      background: btnBackground,
                      border: `1px solid ${btnBorderColor}`,
                      color: btnTextColor,
                      cursor: submitted ? "default" : "pointer",
                      textAlign: "left",
                      fontSize: "14px",
                      fontWeight: "500",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {!submitted ? (
          <div style={{ marginTop: "10px" }}>
            <Button
              onClick={handleSubmit}
              disabled={Object.keys(userAnswers).length < quizData.length}
              fullWidth
            >
              Submit Answers
            </Button>
          </div>
        ) : (
          <div
            style={{
              marginTop: "10px",
              padding: "15px",
              borderRadius: "10px",
              background: "rgba(34, 197, 94, 0.1)",
              border: "1px solid rgba(34, 197, 94, 0.2)",
              textAlign: "center",
            }}
          >
            <h4 style={{ margin: 0, color: "#4ade80", fontSize: "16px" }}>
              Quiz Completed! Score: {score} / {quizData.length}
            </h4>
            <p style={{ margin: "5px 0 0", color: "#94a3b8", fontSize: "13px" }}>
              {score === quizData.length
                ? "Perfect! You master this topic."
                : "Review correct answers highlighted in green above."}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

export default QuizCard;
