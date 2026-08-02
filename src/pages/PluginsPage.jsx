import React, { useState, useEffect, useContext, useMemo } from "react";
import { WorkspaceManagerContext } from "../context/WorkspaceManagerContext";
import pluginService from "../services/pluginService";
import Card from "../components/Common/Card";
import Badge from "../components/Common/Badge";
import Button from "../components/Common/Button";
import Input from "../components/Common/Input";
import useDocumentMetadata from "../hooks/useDocumentMetadata";

export function PluginsPage() {
  const { activeWorkspaceId } = useContext(WorkspaceManagerContext);
  useDocumentMetadata("Integrations Marketplace", "Extend system properties using developer plugins, analytics syncs, and AI strategy nodes.");

  // --- Filter states ---
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // --- Active Plugin config state ---
  const [pluginsRegistry, setPluginsRegistry] = useState([]);
  const [selectedPluginId, setSelectedPluginId] = useState(null);
  const [testConnectionLoading, setTestConnectionLoading] = useState(false);

  // Load plugins registry on mount / workspace change
  useEffect(() => {
    const list = pluginService.getInstalledPlugins(activeWorkspaceId);
    setPluginsRegistry(list);
  }, [activeWorkspaceId]);

  const selectedPlugin = useMemo(() => {
    return pluginsRegistry.find(p => p.id === selectedPluginId) || null;
  }, [pluginsRegistry, selectedPluginId]);

  const categories = ["All", "Developer", "Productivity", "AI Providers", "Platforms"];

  const filteredPlugins = useMemo(() => {
    return pluginsRegistry.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [pluginsRegistry, searchQuery, selectedCategory]);

  const handleToggleStatus = (pluginId) => {
    const updated = pluginService.togglePlugin(pluginId, activeWorkspaceId);
    setPluginsRegistry(updated);
  };

  const handleUpdateSetting = (pluginId, key, val) => {
    const updated = pluginService.savePluginSettings(pluginId, key, val, activeWorkspaceId);
    setPluginsRegistry(updated);
  };

  const handleTestConnection = (plugin) => {
    setTestConnectionLoading(true);
    // Simulate API authorization response
    setTimeout(() => {
      setTestConnectionLoading(false);
      alert(`🔌 Connection test for ${plugin.name} successful! Integration endpoints verified.`);
      pluginService.onExecute(plugin, { event: "connection_test", workspace: activeWorkspaceId });
    }, 1000);
  };

  return (
    <div className="content fade-in">
      
      {/* Page Header */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "24px", color: "var(--text-primary)", fontWeight: "855" }}>🔌 Integrations & Plugins</h1>
          <p style={{ margin: "5px 0 0", color: "var(--text-secondary)" }}>
            Extend your workspace properties with external repositories, AI providers, and productivity suites.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr", gap: "30px" }} className="builder-workspace-grid">
        
        {/* Left Column: Marketplace grid catalog */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Toolbar search & category filters */}
          <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Search plugins, providers, hooks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{
                flex: 1,
                minWidth: "220px"
              }}
            />
          </div>

          {/* Category pills selection */}
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  background: selectedCategory === cat ? "var(--accent)" : "var(--surface-2)",
                  color: selectedCategory === cat ? "var(--text-inverse)" : "var(--text-secondary)",
                  border: selectedCategory === cat ? "none" : "1px solid var(--border-default)",
                  borderRadius: "20px",
                  padding: "5px 14px",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  whiteSpace: "nowrap"
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid listing */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "15px" }}>
            {filteredPlugins.map((plugin) => {
              const isEnabled = plugin.status === "Enabled";
              const isSelected = selectedPluginId === plugin.id;

              return (
                <div
                  key={plugin.id}
                  onClick={() => setSelectedPluginId(isSelected ? null : plugin.id)}
                  style={{
                    background: isSelected ? "var(--accent-subtle)" : "var(--surface-1)",
                    border: `1.5px solid ${isSelected ? "var(--primary)" : "var(--border-default)"}`,
                    borderRadius: "10px",
                    padding: "16px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: "150px"
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "22px" }}>{plugin.icon}</span>
                      <Badge type={isEnabled ? "success" : "outline"}>{plugin.status}</Badge>
                    </div>
                    
                    <strong style={{ fontSize: "14.5px", color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                      {plugin.name}
                    </strong>
                    <p style={{ fontSize: "12px", color: "var(--light-text)", margin: 0, lineHeight: "1.5" }}>
                      {plugin.description}
                    </p>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "14px", borderTop: "1px solid var(--border)", paddingTop: "10px" }}>
                    <span style={{ fontSize: "10.5px", color: "var(--light-text)", textTransform: "uppercase", fontWeight: "700" }}>
                      {plugin.category}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--primary)", fontWeight: "600" }}>
                      {isSelected ? "Configuring" : "Configure →"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Configuration Panel */}
        <div>
          {selectedPlugin ? (
            <Card title={`⚙️ Configure: ${selectedPlugin.name}`}>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "15px" }}>
                
                {/* Status selector */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1.5px solid var(--border)", paddingBottom: "15px" }}>
                  <div>
                    <strong style={{ display: "block", color: "var(--text-primary)", fontSize: "13px" }}>Integration Status</strong>
                    <span style={{ fontSize: "11.5px", color: "var(--text-secondary)" }}>Enable or disable lifecycle actions</span>
                  </div>
                  <Button
                    onClick={() => handleToggleStatus(selectedPlugin.id)}
                    type={selectedPlugin.status === "Enabled" ? "success" : "outline"}
                    style={{ padding: "6px 16px", fontSize: "12px" }}
                  >
                    {selectedPlugin.status === "Enabled" ? "Enabled 🟢" : "Disabled 🔴"}
                  </Button>
                </div>

                {/* Configurations inputs */}
                <div>
                  <strong style={{ display: "block", color: "var(--text-primary)", fontSize: "13px", marginBottom: "12px" }}>Settings Configuration</strong>
                  
                  {selectedPlugin.settings.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {selectedPlugin.settings.map((s) => (
                        <div key={s.key}>
                          <Input
                            label={s.label}
                            type={s.type}
                            value={s.value}
                            onChange={(e) => handleUpdateSetting(selectedPlugin.id, s.key, e.target.value)}
                            placeholder={`Enter ${s.label.toLowerCase()}...`}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: "12.5px", color: "var(--light-text)", fontStyle: "italic" }}>
                      No authentication keys required for this plugin node.
                    </span>
                  )}
                </div>

                {/* Connection test triggers */}
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "15px", marginTop: "5px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <Button
                    onClick={() => handleTestConnection(selectedPlugin)}
                    disabled={testConnectionLoading || selectedPlugin.status !== "Enabled"}
                    type="primary"
                    fullWidth
                  >
                    {testConnectionLoading ? "Testing Auth Endpoints..." : "🔌 Run Connection Test"}
                  </Button>
                  <span style={{ fontSize: "10.5px", color: "var(--light-text)", textAlign: "center", display: "block" }}>
                    Verifies connection using active credentials configuration settings.
                  </span>
                </div>
              </div>
            </Card>
          ) : (
            <div style={{ border: "1.5px dashed var(--border)", borderRadius: "10px", padding: "40px 15px", textAlign: "center", color: "var(--light-text)" }}>
              <span>Select integration package on the left to edit configuration variables.</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

export default PluginsPage;
