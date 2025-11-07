// Sage Memory Engine (local-first)
// - Wisdom Memory entries for Sage stance, outcomes, transcripts
// - Self-revision trigger: checks recent outcomes and returns revision preamble
// - RL signals for ethical, HITL-constrained reinforcement
// - Integrates ACF temporal persistence and EIEE emotional tagging

const WISDOM_KEY = "brahma.wisdom.v1";
const RL_KEY = "brahma.rl.signals.v1";

/**
 * @typedef {{
 *   MemoryID: string,
 *   TimeStamp: string,        // ISO string
 *   TopicTag: string,         // e.g. "Career_Change"
 *   SageStance: string,       // Brief summary of advice
 *   UserOutcomeScore: number, // -2..+2 (0 = unknown)
 *   EmotionState?: string,    // optional
 *   FullTranscript?: string   // optional
 * }} WisdomMemoryEntry
 */

/* ------------------------ Storage helpers ------------------------ */
function _safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

function getAll() {
  return _safeParse(localStorage.getItem(WISDOM_KEY), []);
}

function setAll(arr) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(WISDOM_KEY, JSON.stringify(arr));
  }
}

// Existing exports from PDF snippets
export function recordSageStance(topic, stance, emotion = "neutral") {
  const now = new Date().toISOString();
  const entry = {
    MemoryID: `mem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    TimeStamp: now,
    TopicTag: topic,
    SageStance: stance,
    UserOutcomeScore: 0, // Unknown initially
    EmotionState: emotion,
    FullTranscript: "" // Optional
  };
  const all = getAll();
  all.unshift(entry); // Prepend for recency
  setAll(all.slice(0, 500)); // Limit to 500 entries
  console.log("[Sage Memory] Recorded stance:", entry);
  return entry;
}

export function updateOutcome(memoryId, score, transcript = "") {
  if (typeof window === 'undefined') return;
  const all = getAll();
  const entry = all.find(e => e.MemoryID === memoryId);
  if (entry) {
    entry.UserOutcomeScore = score;
    entry.FullTranscript = transcript;
    setAll(all);
    console.log("[Sage Memory] Updated outcome:", entry);
  }
}

export function queryMemoriesByTopic(topic) {
  return getAll().filter(e => e.TopicTag?.includes(topic)).slice(-10);
}

export function extractTopicTag(text) {
  // Simple keyword-based stub; enhance with NLP later
  const topics = ["career", "relationship", "health", "growth", "exploration"];
  const lower = text.toLowerCase();
  for (const t of topics) {
    if (lower.includes(t)) return t.charAt(0).toUpperCase() + t.slice(1) + "_Change";
  }
  return "General_Reflection";
}

export function inferFailureReason(outcomeScore, transcript = "") {
  if (outcomeScore > 0) return "Success - Aligned with growth";
  if (outcomeScore < 0) {
    // Stub logic
    return transcript.includes("too") ? "Overwhelm threshold exceeded" : "Expectation mismatch";
  }
  return "Pending feedback";
}

export function checkForSelfRevision(memories = []) {
  const recent = memories.slice(-3);
  const lowScores = recent.filter(m => m.UserOutcomeScore < -1);
  return lowScores.length >= 2; // Trigger if 2+ recent failures
}

export function makeRevisionPreamble(memories, failureReason) {
  const themes = memories.map(m => m.TopicTag).join(", ");
  return `Reflecting on recent experiences in ${themes}: "${failureReason}". What patterns emerge? How can I adapt my perspective?`;
}

export function exportWisdomMemories() {
  const all = getAll();
  const blob = new Blob([JSON.stringify(all, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `brahma-wisdom-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importWisdomMemories(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      const all = getAll();
      all.push(...imported);
      setAll(all.slice(0, 500));
      console.log("[Sage Memory] Imported:", imported.length, "entries");
    } catch (err) {
      console.error("[Sage Memory] Import failed:", err);
    }
  };
  reader.readAsText(file);
}

export function _debugGetAll() {
  return { wisdom: getAll(), rl: JSON.parse(localStorage.getItem(RL_KEY) || "[]") };
}

// New RL and synthesis functions (from previous fixes)
export function recordRLRewardSignal(signal) {
  if (typeof window === 'undefined') return; // SSR guard
  const signals = _safeParse(localStorage.getItem(RL_KEY), []);
  const newSignal = {
    ...signal,
    timestamp: new Date().toISOString(),
    id: `rl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  };
  signals.unshift(newSignal); // Prepend for recency
  localStorage.setItem(RL_KEY, JSON.stringify(signals.slice(0, 1000))); // Limit to 1000 recent
  console.log("[RL Engine] Recorded signal:", newSignal);
  return newSignal;
}

export function loadSageMemory(filter = {}) {
  if (typeof window === 'undefined') return { wisdom: [], rlSignals: [], identity: {} };
  const wisdom = getAll();
  const rlSignals = _safeParse(localStorage.getItem(RL_KEY), []);
  const identity = {
    createdAt: localStorage.getItem("brahma.identity.created") || new Date().toISOString(),
    version: "1.0"
  };
  // Apply filter if needed (e.g., by topic or date)
  const filteredWisdom = filter.topic ? wisdom.filter(w => w.TopicTag?.includes(filter.topic)) : wisdom;
  return { wisdom: filteredWisdom, rlSignals, identity };
}

export function synthesizeSagePerspective(memory, emotionalContext = {}) {
  const { wisdom, rlSignals, identity } = memory;
  const recentWisdom = wisdom.slice(-5); // Last 5 entries
  const positiveSignals = rlSignals.filter(s => parseFloat(s.delta || 0) > 0).slice(-3);
  
  // Generate beliefs from wisdom stances
  const beliefs = recentWisdom.map(entry => ({
    id: entry.MemoryID,
    text: entry.SageStance || "Evolving belief",
    strength: Math.abs(entry.UserOutcomeScore || 0) * 10 // 0-20 scale
  }));

  // Derive tensions from RL deltas (e.g., positive vs. negative)
  const tensions = positiveSignals.length > 1 && rlSignals.length > positiveSignals.length
    ? [{ left: "Exploration", right: "Integration", status: "active", leftScore: 65, rightScore: 45 }]
    : [];

  // Insights from positive RL
  const insights = positiveSignals.map(sig => ({ text: `${sig.label} reinforced`, confidence: Math.round((sig.confidence || 0.5) * 100) }));

  // Recent reflections
  const recentReflections = recentWisdom.map(w => ({ text: w.TopicTag || "Reflection" }));

  // Notable Sage responses, tuned by emotional context
  const notableSage = recentWisdom.slice(-2).map(w => ({
    text: `${w.SageStance} (Tone: ${emotionalContext.current || 'neutral'})`
  }));

  return {
    version: identity.version,
    beliefs,
    recentReflections,
    insights,
    tensions,
    notableSage,
    currentFocus: insights.length > 0 ? insights[0].text : "Exploration"
  };
}
