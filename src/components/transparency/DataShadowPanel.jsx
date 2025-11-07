// src/components/transparency/DataShadowPanel.jsx
import React, { useState, useEffect } from "react";
import { getAudit, clearAudit } from "../../kernel/memoryKernel.js";

const DataShadowPanel = ({ isOpen, onClose, theme }) => {
  const [activeTab, setActiveTab] = useState("tracking");
  const [entries, setEntries] = useState(() => getAudit());
  const dataValue = 47.23;

  const trackingData = [
    { source: "Browser Fingerprinting", frequency: "Continuous", value: "$12.40/month", risk: "High" },
    { source: "Location History", frequency: "Every 15 min", value: "$8.90/month", risk: "Medium" },
    { source: "Search Patterns", frequency: "Per query", value: "$15.20/month", risk: "High" },
    { source: "Device Analytics", frequency: "Real-time", value: "$6.80/month", risk: "Low" },
    { source: "Social Graph", frequency: "Daily sync", value: "$3.93/month", risk: "Medium" },
  ];

  useEffect(() => {
    const refresh = () => setEntries(getAudit());
    window.addEventListener("brahma-audit-refresh", refresh);
    return () => window.removeEventListener("brahma-audit-refresh", refresh);
  }, []);

  if (!isOpen) return null;

  const byPrefix = (prefix) =>
    (entries || []).filter((e) => (e.type || "").startsWith(prefix));

  const persona = byPrefix("persona_handoff");
  const sensorium = byPrefix("sensorium_");
  const consent = byPrefix("consent_");
  const catalyst = byPrefix("catalyst_");

  const handleClear = () => {
    if (!window.confirm("Clear the audit log? This cannot be undone.")) return;
    clearAudit();
    setEntries(getAudit());
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Panel shell */}
      <div
        className={`${theme?.glass || "bg-white/10 backdrop-blur-md"} rounded-2xl border border-white/20 shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-gradient-to-r from-purple-600/20 to-pink-600/20 shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-white">Data Shadow Panel</h2>
            <p className="text-gray-300 text-sm">
              Transparency & audit of your local data environment
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-white/10 rounded-xl p-1 sticky top-0 backdrop-blur-sm z-10">
            {["tracking", "value", "protection", "audit"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab
                    ? "bg-purple-600/50 text-white"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                {tab === "tracking"
                  ? "Passive Tracking"
                  : tab === "value"
                  ? "Data Value"
                  : tab === "protection"
                  ? "Protection"
                  : "Audit Ledger"}
              </button>
            ))}
          </div>

          {/* === Tracking === */}
          {activeTab === "tracking" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Active Data Collection</h3>
                <div className="text-xs text-red-400">
                  ⚠️ {trackingData.length} sources detected
                </div>
              </div>
              <div className="space-y-3">
                {trackingData.map((item, i) => (
                  <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-white">{item.source}</h4>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          item.risk === "High"
                            ? "bg-red-500/20 text-red-400"
                            : item.risk === "Medium"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {item.risk} Risk
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Frequency: {item.frequency}</span>
                      <span className="text-emerald-400 font-medium">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* === Value === */}
          {activeTab === "value" && (
            <div className="text-center space-y-6">
              <div>
                <div className="text-4xl font-bold text-white mb-2">${dataValue.toFixed(2)}</div>
                <p className="text-gray-300 text-sm mb-4">
                  Estimated monthly value of your data
                </p>
                <div className="bg-white/10 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-3">Based on industry averages:</p>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-300">Search data:</span>
                      <span className="text-emerald-400 ml-2">$15.20</span>
                    </div>
                    <div>
                      <span className="text-gray-300">Location data:</span>
                      <span className="text-emerald-400 ml-2">$8.90</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* === Protection === */}
          {activeTab === "protection" && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Local-Only Protection Active
              </h3>
              <p className="text-gray-300 text-sm">Your data remains on your device</p>
            </div>
          )}

          {/* === Audit === */}
          {activeTab === "audit" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2 sticky top-0 bg-white/10 backdrop-blur-sm py-2 px-1 rounded">
                <h3 className="text-lg font-semibold text-white">Processing Ledger</h3>
                <button
                  onClick={handleClear}
                  className="px-3 py-1.5 text-xs rounded bg-gray-800 text-white hover:bg-red-700 transition"
                >
                  Clear Audit Log
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <LedgerList title="Sensorium" entries={byPrefix("sensorium_")} field={(e) => e.type} />
                <LedgerList title="Persona Handoffs" entries={byPrefix("persona_handoff")} field={(e) => e.data?.leader} />
                <LedgerList title="Safety & Consent" entries={byPrefix("consent_")} field={(e) => e.type} />
                <LedgerList title="Catalyst Outcomes" entries={byPrefix("catalyst_")} field={(e) => e.type} />
              </div>

              <details className="mt-4">
                <summary className="text-xs text-gray-400 cursor-pointer">View all audit entries</summary>
                <pre className="text-[10px] bg-white/10 p-3 rounded mt-2 max-h-64 overflow-auto text-gray-200">
{JSON.stringify(entries, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 shrink-0">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
            <button
              onClick={onClose}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ===== Ledger List Helper ===== */
function LedgerList({ title, entries, field }) {
  return (
    <div>
      <div className="text-xs font-medium text-gray-400 mb-1">{title}</div>
      <ul className="text-xs text-gray-300 space-y-1 max-h-40 overflow-auto border border-white/10 rounded-lg p-2 bg-white/5">
        {entries.length === 0 && <li className="text-gray-500">None</li>}
        {entries.map((e) => (
          <li key={e.id}>
            {new Date(e.ts).toLocaleString()} — {field(e) || "—"}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DataShadowPanel;