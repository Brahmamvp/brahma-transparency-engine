import React, { useEffect, useMemo, useState } from "react";
// 1) Import the engine root
import { useLocalMemory } from "../context/LocalMemoryContext.jsx";
// ✅ FIXED: Import Cognitive Field must use the .jsx extension
import { useCognitiveField } from "../store/cognitiveField.jsx";


/* -------------------------------------------
   Tiny helpers (kept local to avoid new files)
-------------------------------------------- */
const VIEW_TYPES = { TIMELINE: "timeline", NETWORK: "network" };

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);
  return [value, setValue];
}

const Glass = ({ className = "", children }) => (
  <div
    className={
      "bg-white/10 backdrop-blur-md border border-white/20 rounded-xl " +
      className
    }
  >
    {children}
  </div>
);

const Button = ({ children, className = "", ...props }) => (
  <button
    className={
      "px-4 py-2 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 transition-colors " +
      className
    }
    {...props}
  >
    {children}
  </button>
);

/* -------------------------------------------
   Inline UI atoms
-------------------------------------------- */
const LayerSelector = ({ selected, onChange }) => {
  const layers = [
    { id: "surface", label: "Surface", hint: "immediate reactions" },
    { id: "systemic", label: "Systemic", hint: "patterns & structures" },
    { id: "legacy", label: "Legacy", hint: "historical context" },
    { id: "world", label: "World", hint: "universal themes" },
  ];
  return (
    <Glass className="p-3">
      <div className="flex flex-wrap gap-2">
        {layers.map((l) => (
          <button
            key={l.id}
            onClick={() => onChange(l.id)}
            className={`px-3 py-2 rounded-lg text-sm ${
              selected === l.id
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                : "bg-white/10 hover:bg-white/20 text-gray-200"
            }`}
            title={l.hint}
          >
            {l.label}
          </button>
        ))}
      </div>
    </Glass>
  );
};

const StatsBar = ({ notes }) => {
  const byLayer = useMemo(() => {
    const acc = { surface: 0, systemic: 0, legacy: 0, world: 0 };
    notes.forEach((n) => (acc[n.layer] = (acc[n.layer] || 0) + 1));
    return acc;
  }, [notes]);

  return (
    <Glass className="p-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs text-gray-200">
        <div>
          <div className="font-semibold text-white">{notes.length}</div>
          <div>Total contexts</div>
        </div>
        <div>
          <div className="font-semibold text-white">{byLayer.surface || 0}</div>
          <div>Surface</div>
        </div>
        <div>
          <div className="font-semibold text-white">{byLayer.systemic || 0}</div>
          <div>Systemic</div>
        </div>
        <div>
          <div className="font-semibold text-white">
            {(byLayer.legacy || 0) + (byLayer.world || 0)}
          </div>
          <div>Deep (Legacy+World)</div>
        </div>
      </div>
    </Glass>
  );
};

const TimelineView = ({ notes, onDelete }) => {
  // 2) One-tap “Send to Decision Explorer” helper
  const sendToDecisionExplorer = (note) => {
    window.dispatchEvent(new CustomEvent("brahma:add-decision-option", {
      detail: {
        title: note.text.slice(0, 80),
        rationale: "Captured from Context Engine",
        layer: note.layer,
        source: "context-engine",
        timestamp: note.timestamp,
      }
    }));
    // optional: toast('Sent to Decision Explorer');
  };

  return (
    <div className="space-y-3">
      {notes.length === 0 && (
        <div className="text-sm text-gray-300">No entries yet. Add one below.</div>
      )}
      {notes
        .slice()
        .reverse()
        .map((n) => (
          <Glass key={n.id} className="p-3">
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-gray-400">
                    {new Date(n.timestamp).toLocaleString()}
                    {" • "}
                    <span className="uppercase">{n.layer}</span>
                    {n.method === "voice" ? " • 🎙️" : ""}
                  </div>
                  <div className="mt-1 text-gray-100 whitespace-pre-wrap">
                    {n.text}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                {/* Button to send to Decision Explorer */}
                <button 
                  onClick={() => sendToDecisionExplorer(n)} 
                  className="text-xs px-2 py-1 rounded bg-blue-500/80 hover:bg-blue-600 text-white transition-colors"
                  title="Turn this context into a Decision Option"
                >
                  Add to decisions
                </button>
                <button
                  onClick={() => onDelete(n.id)}
                  className="text-xs px-2 py-1 bg-red-500/80 hover:bg-red-600 text-white rounded-md transition-colors"
                  title="Delete entry"
                >
                  Delete
                </button>
              </div>
            </div>
          </Glass>
        ))}
    </div>
  );
};

const AIInsights = ({ insights }) => (
  <Glass className="p-4">
    <h3 className="font-semibold text-white mb-3">AI Insights</h3>
    {insights.length === 0 ? (
      <div className="text-sm text-gray-300">No insights yet.</div>
    ) : (
      <ul className="space-y-3">
        {insights.map((ins) => (
          <li key={ins.id} className="text-sm text-gray-100">
            <div className="font-medium">{ins.title}</div>
            <div className="text-gray-300">{ins.detail}</div>
          </li>
        ))}
      </ul>
    )}
  </Glass>
);

/* -------------------------------------------
   Context Engine Root (self-contained)
-------------------------------------------- */
export default function ContextEngineRoot() {
  // 🟢 NEW: Use Cognitive Field for state management
  const { state: cf, setLayer: setCognitiveFieldLayer, noteCaptured, bumpTotals } = useCognitiveField();
  // 1) Log context actions to the global audit trail
  const { addAuditEvent, setAmbientContext } = useLocalMemory();

  const [notes, setNotes] = useLocalStorage("brahma-notes", []);
  const [insights, setInsights] = useLocalStorage("brahma-insights", []);
  const [draft, setDraft] = useState("");
  // 🟢 UPDATED: Initialize local layer state from Cognitive Field
  const [layer, setLayer] = useState(cf.currentLayer || "surface");
  const [view, setView] = useState(VIEW_TYPES.TIMELINE);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const filtered = notes; // reserved for future layer filters

  const addNote = () => {
    const text = draft.trim();
    if (!text) return;
    const newNote = {
      id: crypto.randomUUID?.() || Date.now(), // Use crypto.randomUUID if available
      text,
      layer,
      method: "text",
      timestamp: new Date().toISOString(),
    };
    setNotes((prev) => {
      const updatedNotes = [...prev, newNote];
      // 🟢 NEW: Update context count in Cognitive Field
      bumpTotals({ contexts: updatedNotes.length });
      return updatedNotes;
    });
    setDraft("");
    
    // 🟢 NEW: Mark capture in Cognitive Field
    noteCaptured("text");

    // 1) Emit an audit event
    addAuditEvent("context.add", { id: newNote.id, layer: newNote.layer, len: newNote.text.length });

    // lightweight auto-insight every 2 notes
    setTimeout(() => {
      if ((notes.length + 1) % 2 === 0) generateInsights([...notes, newNote]);
    }, 400);
  };

  const deleteNote = (id) => {
    setNotes((prev) => {
      const updatedNotes = prev.filter((n) => n.id !== id);
      // 🟢 NEW: Update context count in Cognitive Field
      bumpTotals({ contexts: updatedNotes.length });
      return updatedNotes;
    });
    addAuditEvent("context.delete", { id });
  }

  const generateInsights = (source = notes) => {
    if (source.length === 0) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      const last = source[source.length - 1];
      const title = last.text.length > 60 ? last.text.slice(0, 57) + "…" : last.text;
      const newInsight = {
        id: Date.now(),
        title: `Pattern around: “${title || "recent context"}”`,
        detail:
          "You often return to this theme within a day. Consider capturing a follow-up question to clarify what you really want to learn or change.",
      };
      setInsights((prev) => [newInsight, ...prev].slice(0, 30));
      setIsAnalyzing(false);
      addAuditEvent("context.insights.generate", { count: 1 });
    }, 800 + Math.random() * 600);
  };

  const exportData = () => {
    const payload = {
      notes,
      insights,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `brahma-context-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addAuditEvent("context.data.export", { noteCount: notes.length });
  };

  // 3) Keep Context Engine layer selection in sync
  useEffect(() => {
    // 🟢 NEW: Sync the local state to the global Cognitive Field state
    setCognitiveFieldLayer(layer);
    setAmbientContext({ selectedLayer: layer });
  }, [layer, setCognitiveFieldLayer, setAmbientContext]);


  return (
    <div className="p-4 sm:p-6 text-white">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Brahma Context Engine
        </h2>
        <p className="text-emerald-400 text-xs">
          Local-first context capture • Pattern hints
        </p>
      </div>

      <StatsBar notes={notes} />

      {/* Controls */}
      <div className="flex flex-wrap gap-3 my-4 justify-center">
        <Button onClick={() => setView(VIEW_TYPES.TIMELINE)}>
          📋 Timeline
        </Button>
        <Button onClick={() => setView(VIEW_TYPES.NETWORK)} disabled>
          🌐 Network (soon)
        </Button>
        <Button onClick={() => generateInsights(notes)} disabled={isAnalyzing || notes.length === 0}>
          {isAnalyzing ? "Analyzing…" : "🧠 Generate Insights"}
        </Button>
        <Button onClick={exportData} disabled={notes.length === 0}>
          📤 Export
        </Button>
      </div>

      {/* Layer selector */}
      <div className="mb-4">
        <LayerSelector selected={layer} onChange={setLayer} />
        <p className="text-[11px] text-gray-300 mt-2 text-center">
          Choose the depth that best matches your entry. You can change it later.
        </p>
      </div>

      {/* Input */}
      <Glass className="p-3 mb-4">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          placeholder="Capture a thought, observation, or question…"
          className="w-full bg-transparent outline-none placeholder-gray-300 text-gray-100"
        />
        <div className="flex justify-end">
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white" onClick={addNote}>
            Add context
          </Button>
        </div>
      </Glass>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: main view */}
        <Glass className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">
              {view === VIEW_TYPES.TIMELINE ? "Context Timeline" : "Pattern Network"}
            </h3>
            <span className="text-xs text-gray-300">{filtered.length} contexts</span>
          </div>
          <div>
            {view === VIEW_TYPES.TIMELINE ? (
              <TimelineView notes={filtered} onDelete={deleteNote} />
            ) : (
              <div className="text-sm text-gray-300">
                Network view will visualize clusters and connections. (Coming soon)
              </div>
            )}
          </div>
        </Glass>

        {/* Right: insights */}
        <AIInsights insights={insights} />
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-gray-400 mt-8">
        © 2025 Brahma • Your data stays local. Your insights stays yours.
      </div>
    </div>
  );
}
