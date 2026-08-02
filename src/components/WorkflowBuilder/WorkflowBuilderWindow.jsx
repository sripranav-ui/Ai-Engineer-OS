import React, { useState, useEffect } from "react";
import NodePalette from "./NodePalette.jsx";
import WorkflowCanvas from "./WorkflowCanvas.jsx";
import WorkflowToolbar from "./WorkflowToolbar.jsx";
import PropertiesPanel from "./PropertiesPanel.jsx";
import MiniMap from "./MiniMap.jsx";
import WorkflowTemplatesModal from "./WorkflowTemplatesModal.jsx";
import WorkflowValidationDrawer from "./WorkflowValidationDrawer.jsx";
import { workflowService } from "../../services/ai/workflow/workflowService.js";
import workflowRegistry from "../../services/ai/workflow/registry/workflowRegistry.js";
import eventBus from "../../services/plugins/eventBus.js";
import { AI_RESEARCH_PIPELINE } from "../../services/ai/workflow/templates.js";
import "./workflowBuilderStyles.css";

export function WorkflowBuilderWindow() {
  const [nodes, setNodes] = useState(AI_RESEARCH_PIPELINE.nodes || []);
  const [edges, setEdges] = useState(AI_RESEARCH_PIPELINE.edges || []);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [executionStatusMap, setExecutionStatusMap] = useState({});
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isValidationOpen, setIsValidationOpen] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [pendingConnectSource, setPendingConnectSource] = useState(null);

  // Subscribe to live workflow execution events
  useEffect(() => {
    const unsubStart = eventBus.subscribe("node.started", ({ nodeId }) => {
      setExecutionStatusMap((prev) => ({ ...prev, [nodeId]: "RUNNING" }));
    });

    const unsubComplete = eventBus.subscribe("node.completed", ({ nodeId }) => {
      setExecutionStatusMap((prev) => ({ ...prev, [nodeId]: "COMPLETED" }));
    });

    return () => {
      unsubStart();
      unsubComplete();
    };
  }, []);

  // Add node from palette or drag-drop
  const handleAddNode = (type, customPos = null) => {
    const id = `node_${Date.now()}_${Math.random().toString(36).substr(2, 3)}`;
    const newNode = {
      id,
      type,
      label: `${type.toUpperCase()} Node`,
      x: customPos ? customPos.x : 200 + nodes.length * 40,
      y: customPos ? customPos.y : 150 + nodes.length * 30,
      config: {},
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(id);
  };

  // Node Move or Drag
  const handleNodeMove = (nodeId, customPos) => {
    if (!nodeId) {
      handleAddNode(customPos.type, { x: customPos.x, y: customPos.y });
    }
  };

  // Connection Start/End
  const handleConnectStart = (nodeId, portType) => {
    if (portType === "source") {
      setPendingConnectSource(nodeId);
    } else if (portType === "target" && pendingConnectSource) {
      if (pendingConnectSource !== nodeId) {
        setEdges((prev) => [...prev, { source: pendingConnectSource, target: nodeId, active: true }]);
      }
      setPendingConnectSource(null);
    }
  };

  // Validate Graph
  const handleValidate = () => {
    const result = workflowRegistry.validateWorkflow({ id: "builder_current", name: "Current Graph", nodes, edges });
    setValidationResult(result);
    setIsValidationOpen(true);
  };

  // Save Workflow Definition
  const handleSave = () => {
    const result = workflowRegistry.validateWorkflow({ id: "builder_current", name: "Current Graph", nodes, edges });
    if (!result.valid) {
      handleValidate();
      return;
    }
    workflowRegistry.registerWorkflow({ id: "builder_current", name: "Current Graph", nodes, edges });
    alert("Workflow saved successfully to registry!");
  };

  // Execute Workflow Graph
  const handleRun = () => {
    try {
      const saved = workflowRegistry.registerWorkflow({ id: "builder_current", name: "Current Graph", nodes, edges });
      setIsRunning(true);
      setExecutionStatusMap({});
      workflowService.runWorkflow(saved.id);
    } catch (err) {
      alert(`Execution Error: ${err.message}`);
    }
  };

  const handleExport = () => {
    const json = JSON.stringify({ id: "builder_export", name: "Exported Graph", nodes, edges }, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "workflow_definition.json";
    a.click();
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const parsed = JSON.parse(evt.target.result);
            setNodes(parsed.nodes || []);
            setEdges(parsed.edges || []);
          } catch (err) {
            alert("Invalid workflow JSON file.");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <div className="flex h-full w-full bg-[#05050A] text-slate-100 overflow-hidden font-sans relative">
      {/* Node Palette */}
      <NodePalette onAddNode={(type) => handleAddNode(type)} />

      {/* Main Canvas & Toolbar */}
      <div className="flex-1 flex flex-col h-full relative">
        <WorkflowToolbar
          onRun={handleRun}
          onPause={() => setIsRunning(false)}
          onSave={handleSave}
          onValidate={handleValidate}
          onExport={handleExport}
          onImport={handleImport}
          onOpenTemplates={() => setIsTemplatesOpen(true)}
          onZoomIn={() => setZoomLevel((z) => Math.min(2, z + 0.1))}
          onZoomOut={() => setZoomLevel((z) => Math.max(0.5, z - 0.1))}
          onFitView={() => setZoomLevel(1)}
          isRunning={isRunning}
        />

        <WorkflowCanvas
          nodes={nodes}
          edges={edges}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
          onNodeMove={handleNodeMove}
          onConnectStart={handleConnectStart}
          zoomLevel={zoomLevel}
          executionStatusMap={executionStatusMap}
        />

        <MiniMap nodes={nodes} />
      </div>

      {/* Properties Panel Drawer */}
      {selectedNode && (
        <PropertiesPanel
          node={selectedNode}
          onClose={() => setSelectedNodeId(null)}
          onChange={(updated) => setNodes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)))}
          onDelete={(id) => {
            setNodes((prev) => prev.filter((n) => n.id !== id));
            setEdges((prev) => prev.filter((e) => e.source !== id && e.target !== id));
            setSelectedNodeId(null);
          }}
        />
      )}

      {/* Modals & Drawers */}
      <WorkflowTemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectTemplate={(tpl) => {
          setNodes(tpl.nodes || []);
          setEdges(tpl.edges || []);
        }}
      />

      <WorkflowValidationDrawer isOpen={isValidationOpen} onClose={() => setIsValidationOpen(false)} validationResult={validationResult} />
    </div>
  );
}

export default WorkflowBuilderWindow;
