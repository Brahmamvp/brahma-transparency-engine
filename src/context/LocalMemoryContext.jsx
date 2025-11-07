// src/context/LocalMemoryContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from "react";

/* ---------- Storage Keys ---------- */
const LOCAL_CONTEXT_KEY = "brahma.localContext.v1";
const AUDIT_KEY        = "brahma.auditTrail.v1";
const MANIFEST_KEY     = "brahma.manifest.v1";

/* ---------- Initial State ---------- */
const initialState = {
  // Local context now has an ambientContext for cross-module biasing
  localContext: {
    userId: null,
    preferences: {},
    contexts: [],          // mix of notes + insights if you want
    ambientContext: {},    // e.g., { selectedLayer: "surface" }
  },
  auditTrail: [],
  manifest: {
    schemaVersion: "1.0",
    allowedFields: ["preferences", "contexts", "ambientContext"],
    redactionRules: ["email", "name"],
  },
  isRedacted: false,
};

/* ---------- Helpers ---------- */
function redactSensitiveData(localContextObj) {
  // Accepts the raw localContext object (not wrapped)
  const cloned = JSON.parse(JSON.stringify(localContextObj || {}));

  if (Array.isArray(cloned.contexts)) {
    cloned.contexts = cloned.contexts.map((c) => {
      const redactedText =
        typeof c.text === "string"
          ? c.text.replace(/[\w.-]+@[\w.-]+/g, "[REDACTED_EMAIL]")
          : c.text;

      return { ...c, text: redactedText };
    });
  }
  // Add more rules as needed (names, phones, etc.)
  return cloned;
}

function download(filename, content, mime = "application/json") {
  try {
    const blob = new Blob(
      [typeof content === "string" ? content : JSON.stringify(content, null, 2)],
      { type: mime }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    console.warn("[LocalMemory] Download failed:", e);
  }
}

/* ---------- Reducer ---------- */
const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_ALL": {
      const { localContext, auditTrail, manifest } = action.payload;
      return {
        ...state,
        localContext: localContext ?? state.localContext,
        auditTrail: Array.isArray(auditTrail) ? auditTrail : state.auditTrail,
        manifest: manifest ?? state.manifest,
      };
    }

    case "SET_CONTEXT":
      return {
        ...state,
        localContext: { ...state.localContext, ...action.payload },
      };

    case "ADD_CONTEXT":
      return {
        ...state,
        localContext: {
          ...state.localContext,
          contexts: [...(state.localContext.contexts || []), action.payload],
        },
      };

    case "SET_AMBIENT":
      return {
        ...state,
        localContext: {
          ...state.localContext,
          ambientContext: { ...(state.localContext.ambientContext || {}), ...action.payload },
        },
      };

    case "REDACT_SENSITIVE": {
      return {
        ...state,
        isRedacted: true,
        localContext: redactSensitiveData(state.localContext),
      };
    }

    case "ADD_AUDIT": {
      const incoming = Array.isArray(action.payload) ? action.payload : [action.payload];
      const merged = [...state.auditTrail, ...incoming];
      // keep last 200 events
      return { ...state, auditTrail: merged.slice(-200) };
    }

    case "UPDATE_MANIFEST":
      return { ...state, manifest: { ...state.manifest, ...action.payload } };

    default:
      return state;
  }
};

/* ---------- Context & Hook ---------- */
const LocalMemoryContext = createContext(null);

export const useLocalMemory = () => {
  const ctx = useContext(LocalMemoryContext);
  if (!ctx) throw new Error("useLocalMemory must be used within LocalMemoryProvider");
  return ctx;
};

/* ---------- Provider ---------- */
export const LocalMemoryProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load once
  useEffect(() => {
    try {
      const savedContext  = localStorage.getItem(LOCAL_CONTEXT_KEY);
      const savedAudit    = localStorage.getItem(AUDIT_KEY);
      const savedManifest = localStorage.getItem(MANIFEST_KEY);

      const localContext = savedContext ? JSON.parse(savedContext).localContext : null;
      const auditTrail   = savedAudit ? JSON.parse(savedAudit).auditTrail : null;
      const manifest     = savedManifest ? JSON.parse(savedManifest).manifest : null;

      dispatch({ type: "LOAD_ALL", payload: { localContext, auditTrail, manifest } });
    } catch (e) {
      console.warn("[LocalMemory] Load failed:", e);
    }
  }, []);

  // Persist on every state change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_CONTEXT_KEY, JSON.stringify({ localContext: state.localContext }));
      localStorage.setItem(AUDIT_KEY, JSON.stringify({ auditTrail: state.auditTrail }));
      localStorage.setItem(MANIFEST_KEY, JSON.stringify({ manifest: state.manifest }));
    } catch (e) {
      console.error("[LocalMemory] Save failed:", e);
    }
  }, [state]);

  /* ----- API (context value) ----- */
  const addAuditEvent = (action, details = {}, agent = "local") => {
    const entry = {
      timestamp: new Date().toISOString(),
      action,
      agent,
      details,
    };
    dispatch({ type: "ADD_AUDIT", payload: entry });
  };

  const exportLocalState = (mode = "state") => {
    // mode: "state" | "audit" | "manifest"
    const map = {
      state:    { filename: `brahma-state-${Date.now()}.json`,    content: { localContext: state.localContext } },
      audit:    { filename: `brahma-audit-${Date.now()}.json`,    content: { auditTrail: state.auditTrail } },
      manifest: { filename: `brahma-manifest-${Date.now()}.json`, content: { manifest: state.manifest } },
    };
    const pkg = map[mode] || map.state;
    download(pkg.filename, pkg.content);
  };

  // optional/no-op placeholder; DecisionExplorer can pass this without error
  const deleteAdvice = (id) => {
    addAuditEvent("advice.delete.requested", { id });
    // Future: if advice stored here, remove it and then audit "advice.deleted"
  };

  const value = {
    // state
    ...state,

    // setters
    setContext: (payload) => dispatch({ type: "SET_CONTEXT", payload }),

    addContext: (payload) => {
      dispatch({ type: "ADD_CONTEXT", payload });
      addAuditEvent("context.add", { id: payload.id, layer: payload.layer, len: (payload.text || "").length });
    },

    setAmbientContext: (payload) => {
      dispatch({ type: "SET_AMBIENT", payload });
      addAuditEvent("ambient.update", payload);
    },

    // 🟢 NEW: key-based update helper expected by useSageOrchestrator
    updateLocalContext: (key, valueOrUpdater) => {
      const current = state.localContext || {};
      const nextVal =
        typeof valueOrUpdater === "function"
          ? valueOrUpdater(current[key])
          : valueOrUpdater;
      const updated = { ...current, [key]: nextVal };
      dispatch({ type: "SET_CONTEXT", payload: updated });
      addAuditEvent("context.update", {
        key,
        preview:
          typeof nextVal === "string"
            ? nextVal.slice(0, 80)
            : Array.isArray(nextVal)
            ? `array(len=${nextVal.length})`
            : typeof nextVal,
      });
    },

    // redaction
    redactSensitive: (ctx = state.localContext) => {
      const redacted = redactSensitiveData(ctx);
      // If you want to apply it to state:
      dispatch({ type: "SET_CONTEXT", payload: redacted });
      addAuditEvent("context.redacted");
      return redacted;
    },

    // audit/manifest helpers
    addAuditEvent,
    logAudit: addAuditEvent, // alias
    updateManifest: (payload) => dispatch({ type: "UPDATE_MANIFEST", payload }),

    // exports + misc
    exportLocalState,
    deleteAdvice,

    // convenience getters (mirror the free functions below)
    getAuditTrail: () => state.auditTrail,
    getManifest: () => state.manifest,
  };

  return <LocalMemoryContext.Provider value={value}>{children}</LocalMemoryContext.Provider>;
};

/* ---------- Free Utility Getters (non-React) ---------- */
export function getAuditTrail() {
  try {
    const saved = localStorage.getItem(AUDIT_KEY);
    return saved ? JSON.parse(saved).auditTrail || [] : [];
  } catch {
    return [];
  }
}

export function getManifest() {
  try {
    const saved = localStorage.getItem(MANIFEST_KEY);
    return saved
      ? JSON.parse(saved).manifest ||
          { schemaVersion: "1.0", allowedFields: ["preferences", "contexts", "ambientContext"] }
      : { schemaVersion: "1.0", allowedFields: ["preferences", "contexts", "ambientContext"], redactionRules: ["email", "name"] };
  } catch {
    return { schemaVersion: "1.0", allowedFields: ["preferences", "contexts", "ambientContext"] };
  }
}

/* ---------- LocalMemory Manager (non-React agents) ---------- */
class LocalMemoryManager {
  _getState() {
    try {
      const saved = localStorage.getItem(LOCAL_CONTEXT_KEY);
      return saved ? JSON.parse(saved).localContext : initialState.localContext;
    } catch {
      return initialState.localContext;
    }
  }

  _saveState(localContext) {
    try {
      localStorage.setItem(LOCAL_CONTEXT_KEY, JSON.stringify({ localContext }));
      const entry = {
        timestamp: new Date().toISOString(),
        action: "memory_update",
        agent: "manager",
        details: { method: "save" },
      };
      const trail = JSON.parse(localStorage.getItem(AUDIT_KEY) || '{"auditTrail":[]}').auditTrail || [];
      localStorage.setItem(AUDIT_KEY, JSON.stringify({ auditTrail: [...trail, entry].slice(-200) }));
    } catch (e) {
      console.error("[LocalMemoryManager] Save failed:", e);
    }
  }

  addInsight(insight) {
    const current = this._getState();
    const newInsight = {
      ...insight,
      id: `insight-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      type: insight.type || "insight",
    };
    const updated = { ...current, contexts: [...(current.contexts || []), newInsight] };
    this._saveState(updated);
    return newInsight;
  }

  setAmbient(partial) {
    const current = this._getState();
    const updated = {
      ...current,
      ambientContext: { ...(current.ambientContext || {}), ...partial },
    };
    this._saveState(updated);
  }

  redactSensitive() {
    const current = this._getState();
    const redacted = redactSensitiveData(current);
    this._saveState(redacted);
  }

  getContexts(filter = {}) {
    const current = this._getState();
    return (current.contexts || []).filter((c) => {
      if (filter.type && c.type !== filter.type) return false;
      if (filter.layer && c.layer !== filter.layer) return false;
      return true;
    });
  }

  clearContexts(type = null) {
    if (!window.confirm("Clear memory contexts?")) return;
    const current = this._getState();
    const filtered = type ? (current.contexts || []).filter((c) => c.type !== type) : [];
    const updated = { ...current, contexts: filtered };
    this._saveState(updated);
  }

  export(mode = "state") {
    const pkg =
      mode === "audit"
        ? { filename: `brahma-audit-${Date.now()}.json`, content: JSON.parse(localStorage.getItem(AUDIT_KEY) || '{"auditTrail":[]}') }
        : mode === "manifest"
        ? { filename: `brahma-manifest-${Date.now()}.json`, content: JSON.parse(localStorage.getItem(MANIFEST_KEY) || '{"manifest":{}}') }
        : { filename: `brahma-state-${Date.now()}.json`, content: JSON.parse(localStorage.getItem(LOCAL_CONTEXT_KEY) || '{"localContext":{}}') };
    download(pkg.filename, pkg.content);
  }
}

const managerInstance = new LocalMemoryManager();

export function getLocalMemoryInstance() {
  return {
    addInsight: managerInstance.addInsight.bind(managerInstance),
    setAmbient: managerInstance.setAmbient.bind(managerInstance),
    redactSensitive: managerInstance.redactSensitive.bind(managerInstance),
    getContexts: managerInstance.getContexts.bind(managerInstance),
    clearContexts: managerInstance.clearContexts.bind(managerInstance),
    export: managerInstance.export.bind(managerInstance),
    // mirror free utils
    getAuditTrail,
    getManifest,
  };
}

export default LocalMemoryContext;