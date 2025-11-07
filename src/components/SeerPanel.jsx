import React, { useState, useEffect } from "react";
import {
  Brain,
  Layers,
  Map,
  Users,
  Zap,
  Lock,
  Activity,
  Download,
  Trash2,
  Eye,
  AlertTriangle,
} from "lucide-react";

/* Local memory helpers (proxy for resolution) */
import {
  getAuditTrail,
  getManifest,
} from "../context/LocalMemoryContext.jsx"; // Adjust path if needed

/* Sage orchestration tie-in */
import { getFlags } from "../kernel/memoryKernel.js"; // ACF runtime flags

/* Small helper for timestamps */
const fmt = (d) => new Date(d).toLocaleString();

/* =========================================================
   SEER STRUCTURAL PANEL
   ========================================================= */
export const SeerPanel = ({ theme, agentConfig }) => {
  const [seerState, setSeerState] = useState({
    version: "1.0",
    structuralMap: "Enterprise View", // e.g., "Personal", "Team", "Org"
    keyRelationships: [], // [{ id: 1, type: "Colleague", strength: 0.7, notes: "Key collaborator" }]
    systemIntegrations: [], // [{ id: 1, name: "CRM Tool", status: "Active", risk: "Low" }]
    hierarchyInsights: [], // [{ level: "Top", influence: 8/10, recommendation: "Strengthen" }]
    acfFlags: { iseLevel: agentConfig?.iseLevel ?? 2, curiosity: agentConfig?.curiosityLevel ?? 0.5 },
    auditTrail: [],
    manifest: {},
  });

  useEffect(() => {
    if (!theme) return;
    // Load initial state from localStorage or defaults
    try {
      const saved = localStorage.getItem("brahma.seer.v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        setSeerState((prev) => ({ ...prev, ...parsed }));
      } else {
        // Demo data for structural mapping
        setSeerState((prev) => ({
          ...prev,
          keyRelationships: [
            { id: 1, type: "Mentor", strength: 0.9, notes: "Strategic guidance on growth" },
            { id: 2, type: "Team", strength: 0.6, notes: "Daily collaboration needs" },
          ],
          systemIntegrations: [
            { id: 1, name: "Email Sync", status: "Active", risk: "Low" },
            { id: 2, name: "Calendar", status: "Pending", risk: "Medium" },
          ],
          hierarchyInsights: [
            { level: "Personal", influence: 9/10, recommendation: "Optimize routines" },
            { level: "Professional", influence: 7/10, recommendation: "Map dependencies" },
          ],
        }));
      }

      // Fetch ACF flags and audit
      const flags = getFlags();
      const audit = getAuditTrail();
      const manifestData = getManifest();
      setSeerState((prev) => ({
        ...prev,
        acfFlags: { ...prev.acfFlags, ...flags },
        auditTrail: audit.slice(-5), // Last 5 for brevity
        manifest,
      }));
    } catch (e) {
      console.warn("SeerPanel load failed:", e);
    }

    // Save on changes (throttle if needed)
    return () => {
      try {
        localStorage.setItem("brahma.seer.v1", JSON.stringify(seerState));
      } catch {}
    };
  }, [theme, agentConfig]);

  const updateRelationship = (id, updates) => {
    setSeerState((prev) => ({
      ...prev,
      keyRelationships: prev.keyRelationships.map((rel) =>
        rel.id === id ? { ...rel, ...updates } : rel
      ),
    }));
  };

  const addIntegration = (newInt) => {
    setSeerState((prev) => ({
      ...prev,
      systemIntegrations: [...prev.systemIntegrations, { id: Date.now(), ...newInt }],
    }));
  };

  const downloadExport = (data, filename) => {
    const content = JSON.stringify(data, null, 2);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearData = () => {
    if (window.confirm("Clear Seer structural data?")) {
      setSeerState((prev) => ({ ...prev, keyRelationships: [], systemIntegrations: [], hierarchyInsights: [] }));
      localStorage.removeItem("brahma.seer.v1");
    }
  };

  const flags = seerState.acfFlags;

  return (
    <div className={`min-h-screen ${theme?.glass || 'bg-gradient-to-br from-indigo-900 to-purple-900'} text-white p-6`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Brain size={32} className="text-indigo-400" />
          <h2 className="text-2xl font-bold">Seer: Structural Mapping</h2>
          <Eye size={20} className={`ml-2 ${flags.seer ? 'text-emerald-400' : 'text-gray-500'}`} title="ISE Active" />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => downloadExport(seerState, `brahma-seer-${Date.now()}.json`)}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition"
            title="Export Map"
          >
            <Download size={18} />
          </button>
          <button
            onClick={clearData}
            className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-white/10 transition"
            title="Clear Data"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* ACF Flags Status */}
      {flags.iseLevel > 1 && (
        <div className="bg-indigo-500/20 border border-indigo-500/30 rounded-lg p-3 mb-6">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-yellow-400" />
            <span className="text-sm">ISE Level {flags.iseLevel}: Enhanced structural analysis active (Curiosity: {flags.curiosity.toFixed(1)})</span>
          </div>
        </div>
      )}

      {/* Key Sections */}
      <div className="space-y-6">
        {/* Relationships Map */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <h3 className="flex items-center gap-2 mb-3 font-semibold">
            <Users size={20} className="text-blue-400" />
            Key Relationships ({seerState.keyRelationships.length})
          </h3>
          <div className="space-y-2">
            {seerState.keyRelationships.map((rel) => (
              <div key={rel.id} className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                <span className="text-sm">{rel.type}: {rel.notes}</span>
                <div className="flex items-center gap-1">
                  <span className="w-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full h-2" style={{ width: `${rel.strength * 100}%` }} />
                  <button
                    onClick={() => updateRelationship(rel.id, { strength: Math.max(0, (rel.strength - 0.1).toFixed(1)) })}
                    className="p-1 text-gray-400 hover:text-white"
                  >
                    <Zap size={12} />
                  </button>
                </div>
              </div>
            ))}
            {seerState.keyRelationships.length === 0 && (
              <p className="text-gray-400 text-sm italic">No relationships mapped. Add via ambient context.</p>
            )}
          </div>
        </div>

        {/* System Integrations */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <h3 className="flex items-center gap-2 mb-3 font-semibold">
            <Layers size={20} className="text-green-400" />
            System Integrations ({seerState.systemIntegrations.length})
          </h3>
          <div className="space-y-2">
            {seerState.systemIntegrations.map((int) => (
              <div key={int.id} className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                <span className="text-sm">{int.name} ({int.status})</span>
                <span className={`px-2 py-1 text-xs rounded ${int.risk === 'Low' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {int.risk}
                </span>
              </div>
            ))}
            <button
              onClick={() => addIntegration({ name: "New Integration", status: "Pending", risk: "Low" })}
              className="w-full p-2 text-xs bg-white/10 rounded-lg hover:bg-white/20 transition mt-2"
            >
              Add Integration
            </button>
          </div>
        </div>

        {/* Hierarchy Insights */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <h3 className="flex items-center gap-2 mb-3 font-semibold">
            <Map size={20} className="text-purple-400" />
            Hierarchy Insights
          </h3>
          <div className="space-y-3">
            {seerState.hierarchyInsights.map((insight) => (
              <div key={insight.level} className="p-3 bg-white/5 rounded-lg">
                <div className="flex justify-between">
                  <span>{insight.level}</span>
                  <span className="text-sm">{insight.influence}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{insight.recommendation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Audit & Manifest Footer */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
          <div>
            <h4 className="text-sm font-medium mb-1">Recent Audit ({seerState.auditTrail.length})</h4>
            {seerState.auditTrail.map((entry, i) => (
              <p key={i} className="text-xs text-gray-500">{fmt(entry.timestamp)}: {entry.action}</p>
            ))}
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Manifest Keys</h4>
            <pre className="text-xs text-gray-400 overflow-auto max-h-20">
              {Object.keys(seerState.manifest).join(', ') || 'No keys'}
            </pre>
          </div>
        </div>
      </div>

      {/* Lock Note */}
      <div className="mt-6 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
        <div className="flex items-center gap-2 text-sm">
          <Lock size={16} className="text-yellow-400" />
          <span>Structural data is local-first. Export for backups.</span>
        </div>
      </div>
    </div>
  );
};

SeerPanel.defaultProps = {
  theme: { glass: "bg-gradient-to-br from-indigo-900 to-purple-900" },
  agentConfig: { iseLevel: 2, curiosityLevel: 0.5 },
};
