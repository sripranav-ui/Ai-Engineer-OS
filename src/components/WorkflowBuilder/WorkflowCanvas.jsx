import React from "react";
import ConnectionLines from "./ConnectionLines.jsx";
import WorkflowNodeCard from "./WorkflowNodeCard.jsx";

export function WorkflowCanvas({
  nodes = [],
  edges = [],
  selectedNodeId,
  onSelectNode,
  onNodeMove,
  onConnectStart,
  zoomLevel = 1,
  executionStatusMap = {},
}) {
  const handleDrop = (e) => {
    e.preventDefault();
    const nodeType = e.dataTransfer.getData("application/reactflow");
    if (!nodeType) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / zoomLevel);
    const y = Math.round((e.clientY - rect.top) / zoomLevel);

    onNodeMove(null, { type: nodeType, x, y });
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="flex-1 h-full relative overflow-hidden bg-slate-950 canvas-grid-pattern cursor-grab active:cursor-grabbing"
    >
      <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top left" }} className="w-full h-full relative">
        <ConnectionLines edges={edges} nodes={nodes} />
        {nodes.map((node) => (
          <WorkflowNodeCard
            key={node.id}
            node={node}
            isSelected={node.id === selectedNodeId}
            onClick={() => onSelectNode(node.id)}
            onConnectStart={onConnectStart}
            status={executionStatusMap[node.id]}
          />
        ))}
      </div>
    </div>
  );
}

export default WorkflowCanvas;
