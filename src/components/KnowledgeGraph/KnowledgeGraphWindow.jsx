import React, { useState, useEffect } from "react";
import GraphFiltersBar from "./GraphFiltersBar.jsx";
import GraphCanvas from "./GraphCanvas.jsx";
import NodeInspectorDrawer from "./NodeInspectorDrawer.jsx";
import workspaceKnowledgeGraph from "../../services/intelligence/workspaceKnowledgeGraph.js";
import projectIndexer from "../../services/intelligence/projectIndexer.js";
import { FiShare2 } from "react-icons/fi";
import "./knowledgeGraphStyles.css";

export function KnowledgeGraphWindow() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeType, setActiveType] = useState("All");
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Initialize Knowledge Graph nodes
  useEffect(() => {
    projectIndexer.indexWorkspace();

    // Default entities layout
    const formatted = [
      { id: "node_1", title: "AI SaaS Platform", type: "Project", x: 250, y: 180 },
      { id: "node_2", title: "Refactor API", type: "Task", x: 450, y: 120 },
      { id: "node_3", title: "RAG Architecture", type: "Note", x: 450, y: 260 },
      { id: "node_4", title: "AI Research Pipeline", type: "Workflow", x: 120, y: 320 },
      { id: "node_5", title: "ResearchAgent", type: "Agent", x: 650, y: 180 },
      { id: "node_6", title: "GitHub Sync", type: "Plugin", x: 280, y: 380 },
      { id: "node_7", title: "Pinned Instructions", type: "Memory", x: 580, y: 340 },
    ];

    const initialEdges = [
      { source: "node_1", target: "node_2" },
      { source: "node_1", target: "node_3" },
      { source: "node_1", target: "node_4" },
      { source: "node_2", target: "node_5" },
      { source: "node_4", target: "node_6" },
      { source: "node_5", target: "node_7" },
    ];

    setNodes(formatted);
    setEdges(initialEdges);
  }, []);

  const filteredNodes = nodes.filter(
    (n) =>
      (activeType === "All" || n.type === activeType) &&
      String(n?.title || "").toLowerCase().includes(String(searchQuery || "").toLowerCase())
  );

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <div className="h-full w-full bg-[#05050A] text-slate-100 flex flex-col font-sans relative overflow-hidden">
      {/* Header Bar */}
      <div className="h-14 border-b border-white/[0.07] px-6 flex items-center justify-between bg-[#0A0D16]/95 backdrop-blur-xl z-10 select-none">
        <div className="flex items-center gap-3 font-bold text-sm text-slate-100 tracking-tight">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <FiShare2 className="w-4 h-4" />
          </div>
          <span>Workspace Intelligence Knowledge Graph</span>
        </div>

        <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-xs text-indigo-300 font-mono font-semibold">
          <span>{filteredNodes.length} Entities | {edges.length} Relationships</span>
        </div>
      </div>

      {/* Filter Bar */}
      <GraphFiltersBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeType={activeType}
        onTypeChange={setActiveType}
        onZoomIn={() => setZoomLevel((z) => Math.min(2, z + 0.1))}
        onZoomOut={() => setZoomLevel((z) => Math.max(0.5, z - 0.1))}
        onFitView={() => setZoomLevel(1)}
      />

      {/* Graph Canvas */}
      <GraphCanvas
        nodes={filteredNodes}
        edges={edges}
        selectedNodeId={selectedNodeId}
        onSelectNode={setSelectedNodeId}
        zoomLevel={zoomLevel}
      />

      {/* Node Inspector Drawer */}
      <NodeInspectorDrawer node={selectedNode} isOpen={!!selectedNode} onClose={() => setSelectedNodeId(null)} />
    </div>
  );
}

export default KnowledgeGraphWindow;
