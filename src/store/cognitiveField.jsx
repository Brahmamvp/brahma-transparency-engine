// src/store/cognitiveField.jsx
import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";

const CF_KEY = "brahma.cognitiveField.v1";

const initial = {
  // perception (Context Engine writes)
  currentLayer: "surface",              // surface | systemic | legacy | world
  emotionalTone: null,                  // e.g., "reflective", "anxious", or from EmotionalSupertags
  activeLayers: ["surface", "systemic", "legacy", "world"],
  lastCaptureMethod: null,              // "text" | "voice"
  lastCaptureAt: null,

  // situation
  timeOfDay: null,                      // morning | afternoon | evening | night
  weekday: null,                        // Mon..Sun
  locationHint: null,                   // optional future use

  // reasoning hooks (Transparency Engine writes)
  lastDecisionTopic: null,
  lastExplanationId: null,

  // stats
  totals: { contexts: 0, insights: 0 },

  // mode
  activeMode: "default",                // default | meeting | study | personal | enterprise
};

function reduce(state, action) {
  switch (action.type) {
    case "LOAD":
      return { ...state, ...action.payload };
    case "SET_LAYER":
      return { ...state, currentLayer: action.layer };
    case "SET_LAYERS":
      return { ...state, activeLayers: action.layers };
    case "SET_TONE":
      return { ...state, emotionalTone: action.tone || null };
    case "SET_MODE":
      return { ...state, activeMode: action.mode };
    case "BUMP_TOTALS":
      return { ...state, totals: { ...state.totals, ...action.totals } };
    case "SET_SITUATION":
      return { ...state, ...action.payload };
    case "CAPTURED":
      return {
        ...state,
        lastCaptureMethod: action.method,
        lastCaptureAt: new Date().toISOString(),
      };
    case "TE_UPDATE":
      return {
        ...state,
        lastDecisionTopic: action.topic ?? state.lastDecisionTopic,
        lastExplanationId: action.explanationId ?? state.lastExplanationId,
      };
    default:
      return state;
  }
}

const Ctx = createContext(null);

export function CognitiveFieldProvider({ children }) {
  const [state, dispatch] = useReducer(reduce, initial);

  // load once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CF_KEY);
      if (raw) dispatch({ type: "LOAD", payload: JSON.parse(raw) });
    } catch (_) {}
    // derive basic temporal context
    const d = new Date();
    const h = d.getHours();
    const timeOfDay = h < 5 ? "night" : h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
    const weekday = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()];
    dispatch({ type: "SET_SITUATION", payload: { timeOfDay, weekday } });
  }, []);

  // persist
  useEffect(() => {
    try { localStorage.setItem(CF_KEY, JSON.stringify(state)); } catch (_) {}
  }, [state]);

  const api = useMemo(() => ({
    state,
    setLayer: (layer) => dispatch({ type: "SET_LAYER", layer }),
    setActiveLayers: (layers) => dispatch({ type: "SET_LAYERS", layers }),
    setTone: (tone) => dispatch({ type: "SET_TONE", tone }),
    setMode: (mode) => dispatch({ type: "SET_MODE", mode }),
    noteCaptured: (method) => dispatch({ type: "CAPTURED", method }),
    bumpTotals: (totals) => dispatch({ type: "BUMP_TOTALS", totals }),
    teUpdate: (topic, explanationId) => dispatch({ type: "TE_UPDATE", topic, explanationId }),
  }), [state]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export const useCognitiveField = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCognitiveField must be used inside CognitiveFieldProvider");
  return ctx;
};

// Optional: build a small string you can append to LLM system/user prompts.
export function buildContextPromptSnippet(state) {
  const parts = [];
  if (state.activeMode && state.activeMode !== "default") parts.push(`mode=${state.activeMode}`);
  if (state.currentLayer) parts.push(`layer=${state.currentLayer}`);
  if (state.timeOfDay) parts.push(`timeOfDay=${state.timeOfDay} (${state.weekday})`);
  if (state.emotionalTone) parts.push(`tone=${state.emotionalTone}`);
  if (state.totals?.contexts) parts.push(`contexts=${state.totals.contexts}`);
  if (state.lastDecisionTopic) parts.push(`lastTopic=${state.lastDecisionTopic}`);
  return `ContextHint: ${parts.join(" • ")}`;
}
