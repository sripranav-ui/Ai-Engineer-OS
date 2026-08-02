import React, { useState, useEffect, useContext, useMemo } from "react";
import { WorkspaceManagerContext } from "../../context/WorkspaceManagerContext";
import { NotificationContext } from "../../context/NotificationContext";
import offlineSyncService from "../../services/offlineSyncService";
import Card from "./Card";
import Button from "./Button";
import Badge from "./Badge";

export function OfflineSyncManager() {
  const { activeWorkspaceId } = useContext(WorkspaceManagerContext);

  const [isOpen, setIsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(offlineSyncService.isOnline());
  const [syncQueue, setSyncQueue] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [lastSynced, setLastSynced] = useState("Never");
  const [syncLoading, setSyncLoading] = useState(false);

  // Sync listener registers
  useEffect(() => {
    const handleNetworkChange = () => {
      setIsOnline(offlineSyncService.isOnline());
    };

    const handleRegistryChange = () => {
      setSyncQueue(offlineSyncService.getSyncQueue(activeWorkspaceId));
      setConflicts(offlineSyncService.getConflicts(activeWorkspaceId));
      setLastSynced(offlineSyncService.getLastSyncedTime(activeWorkspaceId));
    };

    // Listeners bindings
    window.addEventListener("online", handleNetworkChange);
    window.addEventListener("offline", handleNetworkChange);
    window.addEventListener("offline_status_change", handleNetworkChange);
    
    window.addEventListener("sync_queue_update", handleRegistryChange);
    window.addEventListener("sync_conflicts_update", handleRegistryChange);

    // Initial load
    handleNetworkChange();
    handleRegistryChange();

    return () => {
      window.removeEventListener("online", handleNetworkChange);
      window.removeEventListener("offline", handleNetworkChange);
      window.removeEventListener("offline_status_change", handleNetworkChange);
      window.removeEventListener("sync_queue_update", handleRegistryChange);
      window.removeEventListener("sync_conflicts_update", handleRegistryChange);
    };
  }, [activeWorkspaceId]);

  const handleToggleSimulation = () => {
    const nextSimStatus = offlineSyncService.isOnline();
    offlineSyncService.setSimulatedOffline(nextSimStatus);
  };

  const { addNotification } = useContext(NotificationContext);

  const handleManualSync = () => {
    if (syncQueue.length === 0 && conflicts.length === 0) {
      if (addNotification) addNotification("Sync Manager", "No pending sync actions in queue.", "info", "system");
      return;
    }
    setSyncLoading(true);

    setTimeout(() => {
      setSyncLoading(false);
      offlineSyncService.clearQueue(activeWorkspaceId);
      // Save last synced time
      localStorage.setItem(`${activeWorkspaceId}_last_synced_time`, new Date().toLocaleTimeString());
      setLastSynced(new Date().toLocaleTimeString());
      if (addNotification) addNotification("Cloud Sync Complete", "Synced local updates to cloud server successfully!", "success", "system");
    }, 1500);
  };

  const handleTriggerConflict = () => {
    offlineSyncService.triggerMockConflict(activeWorkspaceId);
  };

  const handleResolveConflict = (id, choice) => {
    offlineSyncService.resolveConflict(id, choice, activeWorkspaceId);
  };

  return (
    <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 1000 }}>
      
      {/* Floating Status trigger badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "#0c0f19",
          border: `1.5px solid ${conflicts.length > 0 ? "#ef4444" : "var(--border)"}`,
          color: "white",
          padding: "10px 16px",
          borderRadius: "30px",
          fontSize: "12px",
          fontWeight: "750",
          cursor: "pointer",
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          transition: "transform 0.2s"
        }}
      >
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: isOnline ? "#10b981" : "#ef4444",
            display: "inline-block"
          }}
        />
        {isOnline ? "Online Sync Status" : "Simulated Offline Mode"}
        {syncQueue.length > 0 && (
          <Badge type="warning" style={{ fontSize: "9.5px", padding: "1px 6px" }}>
            {syncQueue.length} Pending
          </Badge>
        )}
        {conflicts.length > 0 && (
          <Badge type="danger" style={{ fontSize: "9.5px", padding: "1px 6px" }}>
            Conflict!
          </Badge>
        )}
      </button>

      {/* Configurations panel card */}
      {isOpen && (
        <div style={{ position: "absolute", bottom: "50px", right: 0, width: "320px" }}>
          <Card style={{ padding: "20px", background: "#0c0f19", border: "1.5px solid var(--border)", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.6)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1.5px solid var(--border)", paddingBottom: "10px", marginBottom: "15px" }}>
              <strong style={{ color: "white", fontSize: "14px" }}>🔌 Offline Sync Center</strong>
              <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", color: "var(--light-text)", fontSize: "16px", cursor: "pointer" }}>×</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              
              {/* Simulated Offline Toggle */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ display: "block", color: "white", fontSize: "12px", fontWeight: "700" }}>Disconnect System</span>
                  <span style={{ fontSize: "11px", color: "var(--light-text)" }}>Simulate database offline modes</span>
                </div>
                <input
                  type="checkbox"
                  checked={!isOnline}
                  onChange={handleToggleSimulation}
                  style={{ width: "32px", height: "16px", cursor: "pointer" }}
                />
              </div>

              {/* Last synced label */}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px" }}>
                <span style={{ color: "var(--light-text)" }}>Last Cloud Sync:</span>
                <strong style={{ color: "#cbd5e1" }}>{lastSynced}</strong>
              </div>

              {/* Sync queue items */}
              <div>
                <strong style={{ display: "block", color: "white", fontSize: "12px", marginBottom: "8px" }}>Local Pending Sync Queue</strong>
                {syncQueue.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px", maxHeight: "110px", overflowY: "auto", border: "1px solid var(--border)", padding: "6px", borderRadius: "6px" }}>
                    {syncQueue.map((item) => (
                      <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#cbd5e1", background: "rgba(255,255,255,0.01)", padding: "4px" }}>
                        <span>⚡ {item.actionType}</span>
                        <span style={{ fontSize: "9px", color: "var(--light-text)" }}>Just now</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: "11.5px", color: "var(--light-text)", fontStyle: "italic" }}>
                    Registry queue empty. All items synced.
                  </span>
                )}
              </div>

              {/* Conflict resolution pane */}
              {conflicts.length > 0 && (
                <div style={{ background: "rgba(239, 68, 68, 0.03)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "8px", padding: "12px" }}>
                  <span style={{ fontSize: "11px", color: "#ef4444", fontWeight: "800", display: "block", marginBottom: "6px" }}>⚠️ MERGE CONFLICT DETECTED</span>
                  
                  {conflicts.map((c) => (
                    <div key={c.id} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <strong style={{ color: "white", fontSize: "11.5px" }}>{c.title}</strong>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "10.5px" }}>
                        <div style={{ background: "#0f172a", padding: "6px", borderRadius: "4px" }}>
                          <span style={{ color: "var(--primary)", display: "block", fontWeight: "700" }}>Local Change:</span>
                          <span style={{ color: "#94a3b8" }}>{c.localValue}</span>
                        </div>
                        <div style={{ background: "#0f172a", padding: "6px", borderRadius: "4px" }}>
                          <span style={{ color: "#10b981", display: "block", fontWeight: "700" }}>Cloud Version:</span>
                          <span style={{ color: "#94a3b8" }}>{c.serverValue}</span>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                        <button
                          onClick={() => handleResolveConflict(c.id, "local")}
                          style={{ flex: 1, background: "none", border: "1px solid var(--primary)", color: "white", padding: "4px", borderRadius: "4px", fontSize: "10px", cursor: "pointer" }}
                        >
                          Keep Local
                        </button>
                        <button
                          onClick={() => handleResolveConflict(c.id, "server")}
                          style={{ flex: 1, background: "var(--primary)", border: "none", color: "white", padding: "4px", borderRadius: "4px", fontSize: "10px", cursor: "pointer", fontWeight: "700" }}
                        >
                          Keep Cloud
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Sync triggers */}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px", display: "flex", gap: "6px" }}>
                <Button
                  onClick={handleManualSync}
                  disabled={syncLoading || !isOnline}
                  type="primary"
                  style={{ flex: 2, padding: "6px 0", fontSize: "11.5px" }}
                >
                  {syncLoading ? "Syncing..." : "🔄 Manual Sync Now"}
                </Button>
                <Button
                  onClick={handleTriggerConflict}
                  disabled={conflicts.length > 0}
                  type="outline"
                  style={{ flex: 1, padding: "6px 0", fontSize: "11.5px" }}
                  title="Simulate a sync conflict between local and cloud changes"
                >
                  💥 Conflict
                </Button>
              </div>

            </div>
          </Card>
        </div>
      )}

    </div>
  );
}

export default OfflineSyncManager;
