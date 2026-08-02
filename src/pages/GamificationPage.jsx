import React, { useContext } from "react";
import AppContext from "../context/AppContext";
import { GamificationContext } from "../context/GamificationContext";
import Card from "../components/Common/Card";
import Badge from "../components/Common/Badge";
import Avatar from "../components/Common/Avatar";
import useDocumentMetadata from "../hooks/useDocumentMetadata";

// =======================================================
// GamificationPage.jsx — Quest Hub
// Achievements, leaderboard, streaks, weekly challenges.
// =======================================================

function GamificationPage() {
  useDocumentMetadata("Quest Hub", "Achievements, streaks, challenges, and leaderboard.");

  const {
    streak: appStreak,
    level: appLevel,
    xpInCurrentLevel,
    nextLevelXp,
  } = useContext(AppContext);

  const { achievements = [], weeklyChallenge = {}, leaderboard = [] } = useContext(GamificationContext);

  const xpPercent = Math.round((xpInCurrentLevel / nextLevelXp) * 100) || 78;
  const totalBlocks = 14;
  const activeBlocks = Math.round((xpPercent / 100) * totalBlocks) || 11;
  const xpBlockBar = "█".repeat(activeBlocks) + "░".repeat(Math.max(0, totalBlocks - activeBlocks));

  return (
    <div className="page-shell fade-in">
      {/* Header */}
      <div className="page-title-block">
        <h1>Quest Hub</h1>
        <p>Execute quests, defeat weekly challenges, and climb the leaderboard.</p>
      </div>

      <div className="hero-workspace-grid">
        {/* ─── LEFT COLUMN ─── */}
        <div className="stagger-enter">

          {/* Level & XP */}
          <div className="mission-card">
            <div className="section-overline">System Status</div>
            <div className="mission-day">Level {appLevel || 17}</div>

            <div className="progress-blocks-container">
              <span className="progress-blocks">{xpBlockBar}</span>
              <span className="progress-percent">{xpPercent}%</span>
            </div>

            <div className="mission-card-footer">
              <span className="mission-card-label">Current Streak</span>
              <span className="mission-card-value text-accent">
                {appStreak || 42} Days
              </span>
            </div>
          </div>

          {/* Daily Quest */}
          <div className="focus-card">
            <div className="section-overline">Daily Quest</div>
            <ul className="focus-list">
              <li className="focus-item text-success">
                <span className="focus-bullet" />
                <span>✓ Finish Lesson</span>
              </li>
              <li className="focus-item text-success">
                <span className="focus-bullet" />
                <span>✓ Solve 3 Problems</span>
              </li>
              <li className="focus-item text-ghost">
                <span className="focus-bullet" />
                <span>Build Mini Project</span>
              </li>
            </ul>
          </div>

          {/* Weekly Challenge */}
          <Card>
            <div className="section-overline">Weekly Challenge</div>
            <h3 className="text-base font-bold text-primary spacer-sm" style={{ margin: 0 }}>
              Complete {weeklyChallenge.text || "TensorFlow Module"}
            </h3>
            <div className="row" style={{ paddingTop: "var(--space-3)", borderTop: "1px solid var(--border-subtle)", marginTop: "var(--space-3)" }}>
              <Badge type="success">+{weeklyChallenge.xpReward || 800} XP</Badge>
              <Badge type="primary">+New Badge</Badge>
            </div>
          </Card>

          {/* Achievements */}
          <div>
            <div className="section-heading">Earned Badges</div>
            <div className="achievements-grid">
              {(achievements || []).map((ach) => (
                <div
                  key={ach.id}
                  className={`achievement-card ${ach.unlocked ? "earned" : ""}`}
                  style={{ opacity: ach.unlocked ? 1 : 0.4 }}
                >
                  <div className="achievement-icon">
                    {ach.unlocked ? ach.icon : "🔒"}
                  </div>
                  <h3 className="achievement-name">{ach.title}</h3>
                  <p className="achievement-desc">{ach.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN ─── */}
        <div className="stagger-enter">
          <div className="section-heading">Global Leaderboard</div>
          <Card>
            <p className="text-xs text-tertiary spacer-sm">
              Compete in real-time. Gain XP to rise through the ranks.
            </p>

            <div className="stack-xs">
              {(leaderboard || []).map((row, idx) => {
                const rank = idx + 1;
                return (
                  <div
                    key={row.name}
                    className={`leaderboard-item ${row.isUser ? "workspace-stat-accent" : ""}`}
                    style={{
                      padding: "var(--space-3) var(--space-4)",
                      borderRadius: "var(--radius-md)",
                      background: row.isUser ? "var(--accent-ghost)" : "transparent",
                      border: row.isUser ? "1px solid var(--border-accent)" : "1px solid transparent",
                    }}
                  >
                    <span className={`leaderboard-rank ${rank <= 3 ? "top" : ""}`}>
                      {rank}
                    </span>
                    <Avatar src={row.avatarUrl} alt={row.name} size="sm" />
                    <span className="leaderboard-name">
                      {row.name} {row.isUser && "⭐"}
                    </span>
                    <span className={`leaderboard-xp ${row.isUser ? "text-accent" : ""}`}>
                      {row.xp} XP
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default React.memo(GamificationPage);
