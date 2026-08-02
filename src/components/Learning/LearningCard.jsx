import Card from "../Common/Card";

function LearningCard({ description, youtubeId, codeExample, practiceQuestions }) {
  return (
    <Card className="learning-card" style={{ marginTop: "20px" }}>
      <h2 style={{ marginBottom: "15px" }}>📖 Lesson Material</h2>
      
      <p
        style={{
          lineHeight: "1.7",
          color: "#cbd5e1",
          fontSize: "15px",
          margin: 0
        }}
      >
        {description}
      </p>

      {/* YouTube Embed */}
      {youtubeId && (
        <div style={{ marginTop: "25px" }}>
          <h3 style={{ color: "#ffffff", marginBottom: "12px", fontSize: "16px", fontWeight: "600" }}>
            🎥 Video Tutorial
          </h3>
          <div
            style={{
              position: "relative",
              paddingBottom: "56.25%",
              height: 0,
              overflow: "hidden",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.05)",
            }}
          >
            <iframe
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: 0,
              }}
              src={`https://www.youtube.com/embed/${youtubeId}`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Code Examples */}
      {codeExample && (
        <div style={{ marginTop: "25px" }}>
          <h3 style={{ color: "#ffffff", marginBottom: "12px", fontSize: "16px", fontWeight: "600" }}>
            💻 Code Example
          </h3>
          <pre
            style={{
              background: "#0f172a",
              padding: "16px",
              borderRadius: "10px",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              overflowX: "auto",
              fontFamily: "Fira Code, Source Code Pro, Courier New, Courier, monospace",
              color: "#38bdf8",
              fontSize: "14px",
              lineHeight: "1.5",
              margin: 0
            }}
          >
            <code>{codeExample}</code>
          </pre>
        </div>
      )}

      {/* Practice Exercises */}
      {practiceQuestions && practiceQuestions.length > 0 && (
        <div style={{ marginTop: "25px" }}>
          <h3 style={{ color: "#ffffff", marginBottom: "12px", fontSize: "16px", fontWeight: "600" }}>
            📝 Practice Exercises
          </h3>
          <ul
            style={{
              paddingLeft: "20px",
              color: "#94a3b8",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              margin: 0
            }}
          >
            {practiceQuestions.map((q, idx) => (
              <li key={idx} style={{ lineHeight: "1.5", fontSize: "14px" }}>
                {q}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

export default LearningCard;