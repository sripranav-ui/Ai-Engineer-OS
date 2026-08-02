import React, { useContext, useState, useEffect, useMemo } from "react";
import { ProjectsContext } from "../context/ProjectsContext";
import ProjectCard from "../components/Projects/ProjectCard";
import ProjectKanban from "../components/Projects/ProjectKanban";
import ProjectDetails from "../components/Projects/ProjectDetails";
import useDocumentMetadata from "../hooks/useDocumentMetadata";
import { Folder, LayoutGrid, ListFilter } from "lucide-react";

// =======================================================
// ProjectsPage.jsx — Linear-Style Minimal Project Tracker
// =======================================================

function ProjectsPage() {
  const { projects } = useContext(ProjectsContext);
  useDocumentMetadata("Projects", "Build, track, and showcase your AI projects.");

  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");

  useEffect(() => {
    if (!selectedProjectId && projects.length > 0) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const selectedProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId) || projects[0] || null;
  }, [projects, selectedProjectId]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDifficulty =
        difficultyFilter === "All" || project.difficulty === difficultyFilter;
      return matchesSearch && matchesDifficulty;
    });
  }, [projects, searchQuery, difficultyFilter]);

  const metrics = useMemo(() => {
    const totalProjects = projects.length;
    const completedProjects = projects.filter((p) => p.completed).length;
    return { totalProjects, completedProjects };
  }, [projects]);

  return (
    <div className="h-full w-full bg-[#050508] text-slate-100 p-8 overflow-y-auto font-sans v2-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.04]">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Studio Projects</h1>
          <p className="text-xs text-slate-400 mt-0.5">Linear-style project workspace and issue tracking</p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0e0e14] border border-white/[0.05] text-xs font-mono text-indigo-300">
          <span>{metrics.completedProjects} / {metrics.totalProjects} Completed</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <input
          type="text"
          placeholder="Filter projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3.5 py-1.5 rounded-lg bg-[#0e0e14] border border-white/10 text-xs text-white outline-none focus:border-indigo-500 w-64 font-sans"
        />

        <div className="flex items-center gap-2">
          {["All", "Beginner", "Intermediate", "Advanced"].map((level) => (
            <button
              key={level}
              onClick={() => setDifficultyFilter(level)}
              className={`px-3 py-1 rounded-md text-xs font-mono transition-all ${
                difficultyFilter === level
                  ? "bg-indigo-600/20 text-white border border-indigo-500/30"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <ProjectKanban
            projects={filteredProjects}
            selectedProjectId={selectedProjectId}
            onSelectProject={(id) => setSelectedProjectId(id)}
          />
        </div>

        {/* Selected Project Drawer */}
        <div className="lg:col-span-4">
          {selectedProject ? (
            <div className="p-6 rounded-2xl bg-[#0e0e14] border border-white/[0.05] space-y-4">
              <ProjectDetails project={selectedProject} />
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 font-mono text-xs">Select a project to view details</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(ProjectsPage);