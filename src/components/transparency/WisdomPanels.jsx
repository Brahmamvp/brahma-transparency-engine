import React, { useState, useEffect } from "react";
import {
  Brain,
  Lightbulb,
  MessageCircle,
  Star,
  TrendingUp,
  RotateCcw,
  Target,
  Zap,
  Lock,
  Activity, // distinct icon for RL panel
  Download,
  Trash2,
} from "lucide-react";

/* Local Sage perspective helpers (via proxy for better resolution) */
import {
  recordRLRewardSignal,
  loadSageMemory,
  synthesizeSagePerspective,
} from "./sageMemorySystem.jsx"; // Relative to transparency folder

/* small helper */
const fmt = (d) => new Date(d).toLocaleString();

/* =========================================================
   WISDOM MEMORY PANEL
   ========================================================= */
export const WisdomMemoryPanel = ({ isOpen, onClose }) => {
  const [wisdomState, setWisdomState] = useState({
    version: "1.0",
    currentFocus: "Exploration",
    recentReflections: [],
    insightsInProgress: [],
    truthTensions: [],
    sageResponses: [],
  });

  useEffect(() => {
    if (!isOpen) return;
    try {
      // Pull a synthesized "perspective snapshot" from the local engine
      const mem = loadSageMemory();
      const snap = synthesizeSagePerspective(mem);

      // Shape the snapshot into the panel state
      const next = {
        version: snap?.version || "1.0",
        currentFocus:
          snap?.beliefs?.find?.((b) => b?.id?.includes?.("uncertainty"))?.text ||
          snap?.currentFocus ||
          "Exploration",
        recentReflections: snap?.recentReflections || [],
        insightsInProgress:
          snap?.insights?.map((t, i) => ({
            id: `insight-${i}`,
            text: t?.text || t || "Evolving insight",
            confidence: Math.round(60 + Math.random() * 35), // visual only
            firstSeen: mem?.identity?.createdAt,
            lastSeen: new Date().toISOString(),
            frequency: Math.ceil(Math.random() * 5),
          })) || [],
        truthTensions:
          snap?.tensions?.map((t, i) => ({
            id: `tension-${i}`,
            left: t?.left || "Autonomy",
            right: t?.right || "Stability",
            status: ["active", "integrating"][i % 2],
            leftScore: Math.round(55 + Math.random() * 25),
            rightScore: Math.round(55 + Math.random() * 25),
            exploredAt: new Date(Date.now() - i * 86400000).toISOString(),
          })) || [],
        sageResponses:
          snap?.notableSage?.map((r, i) => ({
            id: `resp-${i}`,
            topic: "Reflection",
            quote: r?.text || r || "",
            timestamp: new Date(Date.now() - i * 3600000).toISOString(),
            rating: [5, 4, 3, 5][i % 4],
          })) || [],
      };

      setWisdomState(next);
    } catch (error) {
      console.error("[WisdomPanel] Memory load error:", error);
      // Fallback to empty state
      setWisdomState({
        version: "1.0",
        currentFocus: "Exploration",
        recentReflections: [],
        insightsInProgress: [],
        truthTensions: [],
        sageResponses: [],
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Wisdom Memory</h3>
                <p className="text-xs text-purple-200/80">
                  Your evolving understanding and active learning threads
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1.5 text-xs rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 flex items-center gap-2"
                onClick={() => {
                  // light export
                  const blob = new Blob(
                    [JSON.stringify(wisdomState, null, 2)],
                    { type: "application/json" }
                  );
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `brahma-wisdom-${Date.now()}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                className="px-3 py-1.5 text-xs rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 flex items-center gap-2"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>

          {/* Tabs (scrollable if overflow) */}
          <div className="px-6 pt-4">
            <div className="flex overflow-x-auto gap-2 pb-2 -mx-2 px-2">
              {[
                { id: "focus", label: "Current Focus", icon: Lightbulb },
                { id: "insights", label: "Insights in Progress", icon: Star },
                { id: "tensions", label: "Truth Tensions", icon: Target },
                { id: "responses", label: "Sage Responses", icon: MessageCircle },
              ].map(({ id, label, icon: Icon }) => (
                <span
                  key={id}
                  className="inline-flex items-center gap-2 text-xs text-purple-200 bg-white/10 border border-white/20 rounded-lg px-3 py-1"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="p-6 grid lg:grid-cols-2 gap-6">
            {/* Current Focus */}
            <div className="bg-white/10 rounded-xl border border-white/20 p-5">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-yellow-300" />
                Current Self-Learning Focus
              </h4>
              <div className="text-lg text-purple-200">
                "{wisdomState.currentFocus}"
              </div>
              <p className="text-xs text-gray-300 mt-2">
                Active exploration since {fmt(Date.now() - 3 * 86400000)} • revisited{" "}
                {Math.max(1, (wisdomState.insightsInProgress?.length || 1) - 1)} times
              </p>
            </div>

            {/* Status / simple bars */}
            <div className="bg-white/10 rounded-xl border border-white/20 p-5">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-emerald-300" />
                Wisdom Integration Status
              </h4>
              {[
                { label: "Pattern Recognition", val: 80 },
                { label: "Emotional Integration", val: 60 },
                { label: "Wisdom Synthesis", val: 42 },
              ].map((row) => (
                <div key={row.label} className="mb-3">
                  <div className="flex justify-between text-xs text-gray-300 mb-1">
                    <span>{row.label}</span>
                    <span className="text-purple-200">{row.val}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded">
                    <div
                      className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded"
                      style={{ width: `${row.val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Reflections */}
            <div className="bg-white/10 rounded-xl border border-white/20 p-5 lg:col-span-2">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                <MessageCircle className="w-4 h-4 text-sky-300" />
                Recent Reflection Themes
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                {(wisdomState.insightsInProgress || []).slice(0, 2).map((ins) => (
                  <div
                    key={ins.id}
                    className="bg-white/5 rounded-lg border border-white/10 p-4"
                  >
                    <div className="text-purple-200 mb-2">"{ins.text}"</div>
                    <div className="text-xs text-gray-400">
                      First noted: {fmt(ins.firstSeen)} • Last seen: {fmt(ins.lastSeen)}
                    </div>
                  </div>
                ))}
                {(!wisdomState.insightsInProgress ||
                  wisdomState.insightsInProgress.length === 0) && (
                  <div className="text-sm text-gray-400">
                    No active insights yet — start a conversation and come back.
                  </div>
                )}
              </div>
            </div>

            {/* Truth Tensions */}
            <div className="bg-white/10 rounded-xl border border-white/20 p-5 lg:col-span-2">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-pink-300" />
                Truth Tensions
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                {(wisdomState.truthTensions || []).map((t) => (
                  <div key={t.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-purple-200 text-sm">
                        "{t.left}" vs "{t.right}"
                      </span>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full ${
                          t.status === "active"
                            ? "bg-pink-500/20 text-pink-200"
                            : "bg-emerald-500/20 text-emerald-200"
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs text-gray-300">
                      <div>
                        <div className="mb-1">{t.left}</div>
                        <div className="h-2 bg-white/10 rounded">
                          <div
                            className="h-2 bg-pink-500 rounded"
                            style={{ width: `${t.leftScore}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="mb-1">{t.right}</div>
                        <div className="h-2 bg-white/10 rounded">
                          <div
                            className="h-2 bg-sky-500 rounded"
                            style={{ width: `${t.rightScore}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-[11px] text-gray-400 mt-2">
                      Explored {fmt(t.exploredAt)}
                    </div>
                  </div>
                ))}
                {(!wisdomState.truthTensions ||
                  wisdomState.truthTensions.length === 0) && (
                  <div className="text-sm text-gray-400">
                    No tension pairs yet.
                  </div>
                )}
              </div>
            </div>

            {/* Sage Responses */}
            <div className="bg-white/10 rounded-xl border border-white/20 p-5 lg:col-span-2">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-yellow-300" />
                Sage Responses
              </h4>
              <div className="space-y-3">
                {(wisdomState.sageResponses || []).map((r) => (
                  <div
                    key={r.id}
                    className="bg-white/5 rounded-lg border border-white/10 p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="text-purple-200">"{r.quote}"</div>
                      <div className="text-[11px] text-gray-400">{fmt(r.timestamp)}</div>
                    </div>
                    {!!r.rating && (
                      <div className="mt-2 text-[11px] text-yellow-300">
                        {"★".repeat(r.rating)}
                      </div>
                    )}
                  </div>
                ))}
                {(!wisdomState.sageResponses ||
                  wisdomState.sageResponses.length === 0) && (
                  <div className="text-sm text-gray-400">
                    No logged responses yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer privacy */}
          <div className="px-6 py-4 bg-white/5 border-t border-white/10">
            <div className="flex items-center gap-2 text-[11px] text-emerald-200">
              <Lock className="w-4 h-4" />
              All learning happens locally. You can export or clear anytime.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

/* =========================================================
   RL EXPERIENCE LOG
   ========================================================= */
export const RLExperienceLog = ({ isOpen, onClose }) => {
  const [signals, setSignals] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    // create a few demo signals on open (idempotent per open)
    const seed = [
      {
        id: "sig-1",
        when: new Date(Date.now() - 3600_000).toISOString(),
        label: "positive engagement",
        note: "Provided abstract reflection prompt",
        delta: "+0.3 abstract_preference",
        confidence: 0.8,
        sourceSignal: "Rated helpful: 5",
      },
      {
        id: "sig-2",
        when: new Date(Date.now() - 4 * 3600_000).toISOString(),
        label: "silence after suggestion",
        note: "Suggested practical action steps",
        delta: "-0.2 directive_tone",
        confidence: 0.7,
        sourceSignal: "Pause > 20s",
      },
      {
        id: "sig-3",
        when: new Date(Date.now() - 24 * 3600_000).toISOString(),
        label: "continued conversation",
        note: "Used humor in response",
        delta: "+0.1 playful_mode",
        confidence: 0.6,
        sourceSignal: "Follow-up after 10m",
      },
    ];
    setSignals(seed);
  }, [isOpen]);

  const handleReward = (s) => {
    try {
      // record to engine (append-only event)
      recordRLRewardSignal({
        when: new Date().toISOString(),
        label: s?.label || "manual_mark",
        note: s?.note || "Manual reward",
        delta: s?.delta || "+0.1 neutral",
        confidence: s?.confidence ?? 0.5,
        sourceSignal: s?.sourceSignal || "manual",
      });
      console.log("[RL Log] Reinforced signal:", s);
    } catch (error) {
      console.error("[RL Log] Record error:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-emerald-600 to-blue-600 flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">AI Learning Experience Log</h3>
                <p className="text-xs text-emerald-200/80">
                  How Sage adapts based on reward signals and live adjustments
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1.5 text-xs rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 flex items-center gap-2"
                onClick={() => {
                  const blob = new Blob([JSON.stringify(signals, null, 2)], {
                    type: "application/json",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `brahma-rl-log-${Date.now()}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                className="px-3 py-1.5 text-xs rounded-lg bg-white/10 hover:bg-white/20 border border-white/20"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {(signals || []).map((s) => (
              <div
                key={s.id}
                className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-white font-medium">{s.note}</div>
                    <div className="text-xs text-gray-300 mt-1">
                      {s.label} • {fmt(s.when)} •{" "}
                      <span className="text-emerald-200">{s.delta}</span>
                    </div>
                    {s.sourceSignal && (
                      <div className="text-[11px] text-gray-400 mt-1">
                        Source: {s.sourceSignal}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-400">
                    Confidence {Math.round((s.confidence || 0) * 100)}%
                  </span>
                  <button
                    className="px-2 py-1 text-[11px] rounded bg-white/10 hover:bg-white/20 border border-white/20"
                    onClick={() => handleReward(s)}
                    title="Record a similar reward to the local RL log"
                  >
                    Reinforce
                  </button>
                </div>
              </div>
            ))}

            {(!signals || signals.length === 0) && (
              <div className="text-sm text-gray-400">No signals yet.</div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] text-emerald-200">
              <Lock className="w-4 h-4" />
              RL signals are stored locally (private).
            </div>
            <button
              className="px-3 py-1.5 text-[11px] rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 flex items-center gap-2"
              onClick={() => setSignals([])}
            >
              <Trash2 className="w-4 h-4" />
              Clear (UI only)
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default { WisdomMemoryPanel, RLExperienceLog };
