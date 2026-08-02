import React, { useContext, useState, useEffect, useMemo } from "react";
import AppContext from "../context/AppContext";

import RoadmapGrid from "../components/Roadmap/RoadmapGrid";
import RoadmapTimeline from "../components/Roadmap/RoadmapTimeline";

import Card from "../components/Common/Card";
import ProgressBar from "../components/Common/ProgressBar";
import Input from "../components/Common/Input";
import Button from "../components/Common/Button";
import useDocumentMetadata from "../hooks/useDocumentMetadata";

// =======================================================
// RoadmapPage.jsx — Build Journey
// Curriculum path visualization. Timeline + Grid modes.
// =======================================================

function RoadmapPage() {
  const {
    roadmap,
    setRoadmap,
    currentDay,
    setCurrentDay,
    awardXP,
  } = useContext(AppContext);

  useDocumentMetadata("Build", "Your AI Engineer curriculum roadmap.");

  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [viewMode, setViewMode] = useState("timeline");

  useEffect(() => {
    const needsFix = roadmap.some(
      (day) => day.unlocked === undefined || day.completed === undefined
    );

    if (needsFix) {
      const fixedRoadmap = roadmap.map((day) => ({
        ...day,
        completed: day.completed ?? false,
        unlocked: true,
      }));
      setRoadmap(fixedRoadmap);
    }
  }, [roadmap, setRoadmap]);

  function completeDay(id) {
    const updatedRoadmap = roadmap.map((day) => {
      if (day.id === id) return { ...day, completed: true };
      if (day.id === id + 1) return { ...day, unlocked: true };
      return day;
    });

    setRoadmap(updatedRoadmap);
    awardXP(100);

    if (id < roadmap.length) {
      setCurrentDay(id + 1);
    }
  }

  const completedCount = useMemo(() => {
    return roadmap.filter((day) => day.completed).length;
  }, [roadmap]);

  const progressPercent = useMemo(() => {
    return roadmap.length === 0
      ? 0
      : Math.round((completedCount / roadmap.length) * 100);
  }, [roadmap.length, completedCount]);

  const filteredRoadmap = useMemo(() => {
    return roadmap.filter((day) => {
      const matchesSearch =
        day.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        day.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDifficulty =
        difficultyFilter === "All" || day.difficulty === difficultyFilter;
      return matchesSearch && matchesDifficulty;
    });
  }, [roadmap, searchQuery, difficultyFilter]);

  return (
    <div className="page-shell fade-in">
      {/* Page Header */}
      <div className="page-title-block">
        <h1>Build Journey</h1>
        <p>Follow the curriculum path and unlock days one by one.</p>
      </div>

      {/* Progress */}
      <Card className="roadmap-progress-card">
        <div className="row-between">
          <span className="text-sm font-semibold text-primary">
            Curriculum Progress
          </span>
          <span className="text-sm font-bold text-accent text-mono">
            {completedCount} / {roadmap.length} Days ({progressPercent}%)
          </span>
        </div>
        <ProgressBar progress={progressPercent} label="Unlocking milestones..." showValue={false} />
      </Card>

      {/* Filters */}
      <Card className="roadmap-controls">
        <div className="row-between">
          <div className="filter-bar">
            <Input
              placeholder="Search roadmap..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="form-select"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="tab-controls">
            <button
              onClick={() => setViewMode("timeline")}
              className={`tab-btn ${viewMode === "timeline" ? "active" : ""}`}
            >
              Timeline
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`tab-btn ${viewMode === "grid" ? "active" : ""}`}
            >
              Cards
            </button>
          </div>
        </div>
      </Card>

      {/* Main Display */}
      {filteredRoadmap.length > 0 ? (
        viewMode === "timeline" ? (
          <RoadmapTimeline
            roadmap={filteredRoadmap}
            onComplete={completeDay}
            currentDay={currentDay}
          />
        ) : (
          <RoadmapGrid
            roadmap={filteredRoadmap}
            onComplete={completeDay}
            currentDay={currentDay}
          />
        )
      ) : (
        <div className="empty-block">
          <h3>No lessons found</h3>
          <p>Try updating your search query or filters.</p>
        </div>
      )}
    </div>
  );
}

export default React.memo(RoadmapPage);