import { useState } from 'react';
import TransparencyEngine from "./components/transparency/TransparencyEngine.jsx";
import EnterpriseDashboard from "./components/EnterpriseDashboard.jsx";
import AgentStudio from "./components/agent-studio/AgentStudio.jsx";
import { LocalMemoryProvider, useLocalMemory } from "./context/LocalMemoryContext.jsx";
import LLMSettings from './components/settings/LLMSettings.jsx';
import { BrainCircuit } from "lucide-react";

// AppContextOverlay Component (renamed from ContextOverlay)
const AppContextOverlay = ({ onClose }) => {
  const { redactSensitive, localContext, getAuditTrail, getManifest } = useLocalMemory();

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[200] flex items-center justify-center p-8 overflow-auto">
      <div className="bg-gray-900/95 backdrop-blur-xl rounded-xl border border-white/20 max-w-4xl w-full max-h-screen overflow-auto">
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-xl border-b border-white/10 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BrainCircuit size={20} /> Brahma Local Context Vault
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs font-mono text-gray-300">
          <div>
            <h3 className="text-sm font-semibold text-emerald-400 mb-2">Redacted Local State</h3>
            <pre className="bg-black/50 p-3 rounded-lg overflow-x-auto border border-white/10">
              {JSON.stringify(redactSensitive(localContext), null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-yellow-400 mb-2">Audit Trail</h3>
            <pre className="bg-black/50 p-3 rounded-lg overflow-x-auto border border-white/10">
              {JSON.stringify(getAuditTrail(), null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-purple-400 mb-2">System Manifest</h3>
            <pre className="bg-black/50 p-3 rounded-lg overflow-x-auto border border-white/10">
              {JSON.stringify(getManifest(), null, 2)}
            </pre>
          </div>
        </div>

        <div className="p-4 border-t border-white/10 flex gap-2">
          <button
            onClick={() =>
              downloadFile(
                JSON.stringify(redactSensitive(localContext), null, 2),
                `brahma-state-${Date.now()}.json`,
                "application/json"
              )
            }
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white text-xs font-medium"
          >
            Export State
          </button>
          <button
            onClick={() =>
              downloadFile(
                JSON.stringify(getAuditTrail(), null, 2),
                `brahma-audit-${Date.now()}.json`,
                "application/json"
              )
            }
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-white text-xs font-medium"
          >
            Export Audit
          </button>
          <button
            onClick={() =>
              downloadFile(
                JSON.stringify(getManifest(), null, 2),
                `brahma-manifest.json`,
                "application/json"
              )
            }
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-xs font-medium"
          >
            Export Manifest
          </button>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [activeView, setActiveView] = useState("transparency");
  const [showLLMSettings, setShowLLMSettings] = useState(false);
  const [showContextOverlay, setShowContextOverlay] = useState(false);

  const userData = {
    sage: { name: "Sage", form: "orb", emotion: "peaceful" },
  };

  const renderView = () => {
    switch (activeView) {
      case "enterprise":
      case "agentstudio":
        // Assuming these components handle their own views or are full-screen
        return activeView === "enterprise" ? <EnterpriseDashboard /> : <AgentStudio />;
      case "transparency":
      case "context": // 🟢 Now correctly handled by TransparencyEngine
      default:
        return (
          <TransparencyEngine
            userData={userData}
            currentView={activeView}
            handleNavigate={setActiveView}
            onOpenLLMSettings={() => setShowLLMSettings(true)}
            onOpenContextOverlay={() => setShowContextOverlay(true)}
          />
        );
    }
  };

  return (
    <LocalMemoryProvider>
      <div className="w-full h-full relative">
        {renderView()}

        {/* LLM Settings */}
        {showLLMSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
            <div className="relative p-8 bg-white/90 backdrop-blur-md rounded-xl shadow-2xl">
              <button
                onClick={() => setShowLLMSettings(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-900"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
              <LLMSettings />
            </div>
          </div>
        )}

        {/* Context Overlay */}
        {showContextOverlay && (
          <AppContextOverlay onClose={() => setShowContextOverlay(false)} />
        )}
      </div>
    </LocalMemoryProvider>
  );
}

export default App;
