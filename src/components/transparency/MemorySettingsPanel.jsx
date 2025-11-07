// src/components/transparency/MemorySettingsPanel.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  X,
  Database,
  Download,
  Upload,
  Trash2,
  Info,
  Settings,
  Shield,
  Save,
} from "lucide-react";
import {
  loadWisdomState,
  saveWisdomState,
  exportWisdom,
  importWisdom,
  loadRlLog,
  saveRlLog,
  exportRl,
  importRl,
} from "../../lib/wisdomStore";

// LocalStorage keys (kept human-readable)
const MEM_KEYS = {
  enabled: "brahma_memory_enabled",
  mode: "brahma_memory_mode", // 'off' | 'context' | 'emotional' | 'full'
  retentionDays: "brahma_memory_retention_days", // number or -1 for forever
  scopeReflections: "brahma_scope_reflections",
  scopeDecisions: "brahma_scope_decisions",
  scopeEmotions: "brahma_scope_emotions",
  scopeConversations: "brahma_scope_conversations",
};

// Simple helpers
const safeGet = (k, fallback) => {
  try {
    const v = localStorage.getItem(k);
    return v === null ? fallback : v;
  } catch {
    return fallback;
  }
};
const safeSet = (k, v) => {
  try {
    localStorage.setItem(k, v);
  } catch {}
};

// Retention options
const RETENTION_PRESETS = [
  { label: "1 week", days: 7 },
  { label: "1 month", days: 30 },
  { label: "3 months", days: 90 },
  { label: "1 year", days: 365 },
  { label: "Forever (local)", days: -1 },
];

// Modes with tiny tooltips
const MODES = [
  {
    value: "off",
    label: "Off",
    hint: "No memories are stored.",
  },
  {
    value: "context",
    label: "Contextual Only",
    hint: "Store light context (projects, tags) without emotions.",
  },
  {
    value: "emotional",
    label: "Emotional + Insight Tracking",
    hint: "Track reflections, emotions, and draft insights.",
  },
  {
    value: "full",
    label: "Full Relational Recall",
    hint: "Deepest recall: patterns, tensions, relational threads.",
  },
];

const MemorySettingsPanel = ({ isOpen, onClose }) => {
  const [enabled, setEnabled] = useState(
    safeGet(MEM_KEYS.enabled, "true") !== "false"
  );
  const [mode, setMode] = useState(safeGet(MEM_KEYS.mode, "emotional"));
  const [retentionDays, setRetentionDays] = useState(
    Number(safeGet(MEM_KEYS.retentionDays, "90"))
  );

  const [scope, setScope] = useState({
    reflections: safeGet(MEM_KEYS.scopeReflections, "true") !== "false",
    decisions: safeGet(MEM_KEYS.scopeDecisions, "true") !== "false",
    emotions: safeGet(MEM_KEYS.scopeEmotions, "true") !== "false",
    conversations: safeGet(MEM_KEYS.scopeConversations, "true") !== "false",
  });

  const [activeTab, setActiveTab] = useState("storage"); // 'storage' | 'scope' | 'export'
  const [busy, setBusy] = useState(false);
  const importInputRef = useRef(null);

  // persist settings
  useEffect(() => {
    safeSet(MEM_KEYS.enabled, enabled ? "true" : "false");
  }, [enabled]);

  useEffect(() => {
    safeSet(MEM_KEYS.mode, mode);
  }, [mode]);

  useEffect(() => {
    safeSet(MEM_KEYS.retentionDays, String(retentionDays));
  }, [retentionDays]);

  useEffect(() => {
    safeSet(MEM_KEYS.scopeReflections, scope.reflections ? "true" : "false");
    safeSet(MEM_KEYS.scopeDecisions, scope.decisions ? "true" : "false");
    safeSet(MEM_KEYS.scopeEmotions, scope.emotions ? "true" : "false");
    safeSet(MEM_KEYS.scopeConversations, scope.conversations ? "true" : "false");
  }, [scope]);

  const retentionLabel = useMemo(() => {
    const match = RETENTION_PRESETS.find((r) => r.days === retentionDays);
    return match ? match.label : `${retentionDays} days`;
  }, [retentionDays]);

  // Export all (wisdom + rl + quick reflections + history)
  const handleExportAll = async () => {
    setBusy(true);
    try {
      const wisdomBundle = exportWisdom();
      const rlBundle = exportRl();
      // include quick reflections & chat history as-is
      const reflections =
        JSON.parse(localStorage.getItem("brahma-quick-reflections") || "[]") ??
        [];
      const history =
        JSON.parse(localStorage.getItem("brahma-history") || "[]") ?? [];

      const bundle = {
        type: "brahma_memory_export",
        version: "1.0",
        exportedAt: new Date().toISOString(),
        wisdom: wisdomBundle,
        rl: rlBundle,
        reflections,
        history,
        settings: {
          enabled,
          mode,
          retentionDays,
          scope,
        },
      };

      const blob = new Blob([JSON.stringify(bundle, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `brahma-memory-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast("Exported memory bundle");
    } catch {
      toast("Export failed");
    } finally {
      setBusy(false);
    }
  };

  const handleImportAll = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      const text = await file.text();
      const json = JSON.parse(text);

      // Accept either a full bundle or just each subset
      if (json?.wisdom) importWisdom(json.wisdom);
      if (json?.rl) importRl(json.rl);

      // restore reflections/history if present
      if (Array.isArray(json?.reflections)) {
        localStorage.setItem(
          "brahma-quick-reflections",
          JSON.stringify(json.reflections)
        );
      }
      if (Array.isArray(json?.history)) {
        localStorage.setItem("brahma-history", JSON.stringify(json.history));
      }

      // restore settings if present
      if (json?.settings) {
        const s = json.settings;
        if (typeof s.enabled === "boolean") setEnabled(s.enabled);
        if (typeof s.mode === "string") setMode(s.mode);
        if (typeof s.retentionDays === "number") setRetentionDays(s.retentionDays);
        if (s.scope && typeof s.scope === "object") {
          setScope((prev) => ({ ...prev, ...s.scope }));
        }
      }

      toast("Imported memory bundle");
    } catch {
      toast("Import failed");
    } finally {
      setBusy(false);
      if (importInputRef.current) importInputRef.current.value = "";
    }
  };

  // Wipe memory data (local only)
  const handleWipeAll = async () => {
    if (
      !window.confirm(
        "Erase all locally stored wisdom, RL logs, quick reflections, and history? This cannot be undone."
      )
    )
      return;

    setBusy(true);
    try {
      // Clear known stores
      localStorage.removeItem("brahma_wisdom_state_v1");
      localStorage.removeItem("brahma_rl_experience_v1");
      localStorage.removeItem("brahma-quick-reflections");
      localStorage.removeItem("brahma-history");

      // Optionally disable memory and reset mode
      setEnabled(false);
      setMode("off");

      toast("Local memory cleared");
    } catch {
      toast("Failed to clear memory");
    } finally {
      setBusy(false);
    }
  };

  // Light toast
  const toast = (msg) => {
    const d = document.createElement("div");
    d.className =
      "fixed top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-4 py-2 rounded-lg z-[100] shadow-lg";
    d.textContent = msg;
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      {/* Panel */}
      <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-gradient-to-r from-purple-600/20 to-pink-600/20">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-purple-300" />
            <div>
              <h2 className="text-white font-semibold">Memory Settings</h2>
              <p className="text-xs text-purple-200/80">
                Control how your Wisdom Memory and RL signals are stored locally.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-300"
            aria-label="Close memory settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex">
          {/* Tabs */}
          <aside className="hidden sm:block w-48 border-r border-white/10 p-3">
            <nav className="space-y-1">
              <TabButton
                active={activeTab === "storage"}
                onClick={() => setActiveTab("storage")}
                icon={<Settings className="w-4 h-4" />}
                label="Storage"
              />
              <TabButton
                active={activeTab === "scope"}
                onClick={() => setActiveTab("scope")}
                icon={<Shield className="w-4 h-4" />}
                label="Scope"
              />
              <TabButton
                active={activeTab === "export"}
                onClick={() => setActiveTab("export")}
                icon={<Download className="w-4 h-4" />}
                label="Export / Reset"
              />
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 p-6 overflow-y-auto">
            {activeTab === "storage" && (
              <section className="space-y-4">
                <ToggleRow
                  label="Enable Memory Storage"
                  description="Turn off to prevent saving any new memories locally."
                  value={enabled}
                  onChange={() => setEnabled((v) => !v)}
                />

                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-white">Wisdom Memory Mode</div>
                      <div className="text-xs text-gray-400">
                        Choose how deeply Brahma recalls your patterns.
                      </div>
                    </div>
                    <div className="relative">
                      <select
                        value={mode}
                        onChange={(e) => setMode(e.target.value)}
                        className="bg-white/10 text-white text-sm border border-white/20 rounded-lg px-3 py-2 focus:outline-none"
                      >
                        {MODES.map((m) => (
                          <option key={m.value} value={m.value} className="bg-gray-900">
                            {m.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-purple-200/80">
                    {MODES.find((m) => m.value === mode)?.hint}
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-white">Retention</div>
                      <div className="text-xs text-gray-400">
                        How long should memories persist on this device?
                      </div>
                    </div>
                    <div>
                      <select
                        value={retentionDays}
                        onChange={(e) => setRetentionDays(Number(e.target.value))}
                        className="bg-white/10 text-white text-sm border border-white/20 rounded-lg px-3 py-2 focus:outline-none"
                      >
                        {RETENTION_PRESETS.map((r) => (
                          <option key={r.days} value={r.days} className="bg-gray-900">
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-purple-200/80">
                    Current: {retentionLabel}
                  </div>
                </div>

                <div className="text-xs text-purple-300 italic">
                  Governed by the Wisdom Integration Layer • RL signals logged locally • You own your evolution
                </div>
              </section>
            )}

            {activeTab === "scope" && (
              <section className="space-y-3">
                <ScopeRow
                  label="Store Reflection Logs"
                  checked={scope.reflections}
                  onChange={(v) => setScope((p) => ({ ...p, reflections: v }))}
                />
                <ScopeRow
                  label="Store Decisions & Outcomes"
                  checked={scope.decisions}
                  onChange={(v) => setScope((p) => ({ ...p, decisions: v }))}
                />
                <ScopeRow
                  label="Store Emotional Transitions"
                  checked={scope.emotions}
                  onChange={(v) => setScope((p) => ({ ...p, emotions: v }))}
                />
                <ScopeRow
                  label="Store Sage Conversations"
                  checked={scope.conversations}
                  onChange={(v) => setScope((p) => ({ ...p, conversations: v }))}
                />

                <div className="mt-4 text-xs text-gray-400">
                  Scopes limit what's added to memory going forward. They don't
                  delete existing data (use Reset in Export/Reset tab for that).
                </div>
              </section>
            )}

            {activeTab === "export" && (
              <section className="space-y-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-sm text-white">Export Memory</div>
                      <div className="text-xs text-gray-400">
                        Export wisdom, RL logs, reflections, and history to a single JSON.
                      </div>
                    </div>
                    <button
                      onClick={handleExportAll}
                      disabled={busy}
                      className="px-3 py-2 text-xs rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center gap-2 disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="px-3 py-2 text-xs rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center gap-2 cursor-pointer">
                      <Upload className="w-4 h-4" />
                      Import JSON
                      <input
                        ref={importInputRef}
                        type="file"
                        accept="application/json"
                        className="hidden"
                        onChange={(e) => handleImportAll(e.target.files?.[0])}
                      />
                    </label>
                    <div className="text-xs text-gray-400">
                      Import a previously exported bundle.
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-white">Reset / Forget Everything</div>
                      <div className="text-xs text-gray-400">
                        Permanently erases local wisdom, RL logs, reflections, and history.
                      </div>
                    </div>
                    <button
                      onClick={handleWipeAll}
                      disabled={busy}
                      className="px-3 py-2 text-xs rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 flex items-center gap-2 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Wipe Local Memory
                    </button>
                  </div>
                </div>

                <div className="text-xs text-purple-300 italic">
                  Governed by the Wisdom Integration Layer • RL signals logged locally • You own your evolution
                </div>
              </section>
            )}
          </main>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
          <div className="text-xs text-purple-200/70">
            Preferences save instantly to your device.
          </div>
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* ===== UI helpers ===== */

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
        active ? "bg-white/15 text-white" : "text-purple-200 hover:bg-white/10"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function ToggleRow({ label, description, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
      <div>
        <div className="text-sm text-white">{label}</div>
        {description && <div className="text-xs text-gray-400">{description}</div>}
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" checked={value} onChange={onChange} />
        <div className="w-10 h-5 bg-gray-600 rounded-full peer peer-checked:bg-purple-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-4 after:w-4 after:rounded-full after:transition-all peer-checked:after:translate-x-5" />
      </label>
    </div>
  );
}

function ScopeRow({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
      <div className="text-sm text-white">{label}</div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="w-10 h-5 bg-gray-600 rounded-full peer peer-checked:bg-purple-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-4 after:w-4 after:rounded-full after:transition-all peer-checked:after:translate-x-5" />
      </label>
    </div>
  );
}

export default MemorySettingsPanel;
