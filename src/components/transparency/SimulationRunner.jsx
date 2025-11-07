import React, { useEffect, useMemo, useState } from "react";
import {
  X,
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Heart,
  Users,
  Target,
  RefreshCw,
  Download,
  Copy,
} from "lucide-react";

/**
 * SimulationRunner
 * Props:
 *  - scenario: string (what the user wants to simulate)
 *  - onClose: () => void
 *
 * Enhancements:
 *  - Weight presets to compute a Decision Score per pathway
 *  - Export JSON, Copy Insight, Rerun
 *  - Notes saved with the simulation
 *  - Esc to close, localStorage persistence
 */

const STORAGE_KEY = "brahma-simulations";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const PRESETS = [
  {
    id: "balanced",
    label: "Balanced",
    weights: { career: 1, relationships: 1, finances: 1, wellbeing: 1, growth: 1 },
  },
  {
    id: "career",
    label: "Career Focus",
    weights: { career: 2, relationships: 1, finances: 1.5, wellbeing: 0.75, growth: 1.5 },
  },
  {
    id: "wellbeing",
    label: "Wellbeing Focus",
    weights: { career: 0.75, relationships: 1.5, finances: 0.9, wellbeing: 2, growth: 1.25 },
  },
];

export default function SimulationRunner({ scenario, onClose }) {
  const [results, setResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedPathway, setSelectedPathway] = useState(null);
  const [presetId, setPresetId] = useState("balanced");
  const [note, setNote] = useState("");

  // Close on Esc
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const weights = useMemo(
    () => PRESETS.find((p) => p.id === presetId)?.weights || PRESETS[0].weights,
    [presetId]
  );

  const run = async () => {
    setIsRunning(true);
    setResults(null);
    await sleep(1600);

    // ---- mock engine output (replace later with real service) ----
    const mock = {
      persona: {
        name: "Alex Chen",
        age: 28,
        location: "Seattle",
        currentRole: "Product Manager",
        constraints: ["$85k in savings", "Partner in current city", "Visa concerns"],
        goals: ["Career growth", "Work-life balance", "Financial security"],
        values: ["Authenticity", "Learning", "Connection", "Impact"],
      },
      pathways: [
        {
          id: 1,
          title: "Accept Remote Role",
          timeHorizon: "6 months",
          costs: {
            financial: "$5,000 relocation",
            emotional: "Medium stress",
            time: "3 weeks transition",
            opportunity: "Current team relationships",
          },
          benefits: [
            "$120k salary (+35%)",
            "Flexible schedule",
            "Learning new tech stack",
            "Global team exposure",
            "Better work-life integration",
          ],
          risks: [
            "Less mentorship",
            "Team integration challenges",
            "Potential isolation",
            "Unknown company culture",
            "Remote communication gaps",
          ],
          probability: 0.75,
          impact: { career: 8, relationships: 6, finances: 9, wellbeing: 7, growth: 8 },
        },
        {
          id: 2,
          title: "Negotiate Current Position",
          timeHorizon: "3 months",
          costs: {
            financial: "Minimal",
            emotional: "Low stress",
            time: "2 weeks prep",
            opportunity: "Potential external offers",
          },
          benefits: [
            "Known team dynamics",
            "Proven track record",
            "Local network",
            "Established relationships",
            "Predictable environment",
          ],
          risks: [
            "Limited growth ceiling",
            "Same compensation band",
            "Stagnation risk",
            "Market rate gap",
            "Reduced learning curve",
          ],
          probability: 0.85,
          impact: { career: 5, relationships: 8, finances: 6, wellbeing: 8, growth: 5 },
        },
        {
          id: 3,
          title: "Explore Third Option",
          timeHorizon: "4 months",
          costs: {
            financial: "$2,000 interview costs",
            emotional: "High uncertainty",
            time: "6 weeks searching",
            opportunity: "Current stability",
          },
          benefits: [
            "Best of both worlds potential",
            "Market rate discovery",
            "Expanded network",
            "Negotiation leverage",
            "Multiple options",
          ],
          risks: [
            "Extended uncertainty",
            "Opportunity cost",
            "Interview fatigue",
            "Current role tension",
            "Decision paralysis",
          ],
          probability: 0.6,
          impact: { career: 7, relationships: 5, finances: 7, wellbeing: 6, growth: 9 },
        },
      ],
      sageInsight:
        "This decision touches your core need for growth while honoring your desire for stability. Neither path is purely logical—both require trusting your instincts about which challenge will serve your long-term fulfillment.",
      recommendations: [
        {
          type: "article",
          title: "The Remote Work Transition Guide",
          source: "Harvard Business Review",
          description: "Practical strategies for succeeding in remote roles",
        },
        {
          type: "tool",
          title: "Salary Negotiation Calculator",
          source: "PayScale",
          description: "Data-driven approach to compensation discussions",
        },
        {
          type: "community",
          title: "Product Manager Career Network",
          source: "Mind the Product",
          description: "Connect with PMs who made similar transitions",
        },
      ],
    };
    setResults(mock);
    setIsRunning(false);

    // persist (include note)
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      saved.unshift({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        scenario,
        note,
        results: mock,
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch {}
  };

  useEffect(() => {
    if (scenario) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario]);

  const scoreFor = (p) => {
    // Weighted average of impact (0–10), multiplied by probability (0–1), scaled to 0–100
    const w = weights;
    const totalW =
      w.career + w.relationships + w.finances + w.wellbeing + w.growth || 1;
    const weightedImpact =
      (p.impact.career * w.career +
        p.impact.relationships * w.relationships +
        p.impact.finances * w.finances +
        p.impact.wellbeing * w.wellbeing +
        p.impact.growth * w.growth) /
      totalW;
    return Math.round(weightedImpact * p.probability * 10);
  };

  const bestPathId = useMemo(() => {
    if (!results) return null;
    let best = { id: null, score: -1 };
    for (const p of results.pathways) {
      const s = scoreFor(p);
      if (s > best.score) best = { id: p.id, score: s };
    }
    return best.id;
  }, [results, weights]);

  const impactColor = (v) =>
    v >= 8 ? "bg-green-400" : v >= 6 ? "bg-yellow-400" : "bg-red-400";

  if (!scenario) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-white/10 bg-white/5 px-6 py-4 backdrop-blur">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
              <Brain className="h-6 w-6 text-purple-300" /> Decision Simulation
            </h2>
            <p className="text-sm text-purple-200/80">
              Exploring: "{scenario}"
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={run}
              className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20"
              title="Rerun"
            >
              <RefreshCw className="h-4 w-4" />
              Rerun
            </button>
            <button
              onClick={onClose}
              className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/20"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-8 p-6">
          {/* Note */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <label className="mb-2 block text-sm font-medium text-purple-100">
              Notes for this simulation (saved)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What matters most about this decision? Any constraints or preferences?"
              className="h-20 w-full resize-none rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-purple-50 placeholder-purple-200/50 outline-none focus:ring-2 focus:ring-purple-400/50"
            />
          </div>

          {/* Running */}
          {isRunning && (
            <div className="py-16 text-center">
              <div className="mx-auto mb-5 h-16 w-16 animate-spin rounded-full border-4 border-purple-500/30 border-t-purple-500"></div>
              <h3 className="mb-1 text-lg font-medium text-white">
                Running simulation…
              </h3>
              <p className="text-sm text-purple-200/80">
                Analyzing pathways, costs, and outcomes
              </p>
            </div>
          )}

          {/* Results */}
          {!isRunning && results && (
            <>
              {/* Persona */}
              <section className="rounded-xl border border-white/10 bg-white/5 p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-white">
                  <Users className="h-5 w-5 text-blue-300" />
                  Simulated Persona
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="mb-2 font-medium text-white">
                      {results.persona.name}
                    </h4>
                    <div className="space-y-1 text-sm text-purple-100/90">
                      <p>Age: {results.persona.age}</p>
                      <p>Location: {results.persona.location}</p>
                      <p>Role: {results.persona.currentRole}</p>
                    </div>
                  </div>
                  <div>
                    <h5 className="mb-2 font-medium text-white">
                      Current Constraints
                    </h5>
                    <ul className="space-y-1 text-sm text-purple-100/90">
                      {results.persona.constraints.map((c, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <AlertTriangle className="h-3 w-3 flex-shrink-0 text-yellow-300" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <h5 className="mb-2 font-medium text-white">Goals</h5>
                    <ul className="space-y-1 text-sm text-purple-100/90">
                      {results.persona.goals.map((g, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Target className="h-3 w-3 flex-shrink-0 text-green-300" />
                          {g}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="mb-2 font-medium text-white">Core Values</h5>
                    <div className="flex flex-wrap gap-2">
                      {results.persona.values.map((v, i) => (
                        <span
                          key={i}
                          className="rounded-full border border-purple-400/30 bg-purple-500/20 px-2 py-1 text-xs text-purple-100"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Weights + Scores */}
              <section className="rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="flex items-center gap-2 text-lg font-medium text-white">
                    <TrendingUp className="h-5 w-5 text-green-300" />
                    Pathway Analysis
                  </h3>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-purple-200/80">Weights:</span>
                    {PRESETS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setPresetId(p.id)}
                        className={`rounded-lg px-3 py-1.5 text-xs ${
                          presetId === p.id
                            ? "bg-white/20 text-white"
                            : "bg-white/10 text-purple-100 hover:bg-white/15"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  {results.pathways.map((p) => {
                    const score = scoreFor(p); // 0–100
                    const isBest = p.id === bestPathId;

                    return (
                      <div
                        key={p.id}
                        onClick={() =>
                          setSelectedPathway((cur) => (cur === p.id ? null : p.id))
                        }
                        className={`cursor-pointer rounded-xl border p-6 transition-all ${
                          selectedPathway === p.id
                            ? "border-purple-400 bg-purple-400/10"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <div className="mb-4 flex items-start justify-between">
                          <h4 className="font-medium text-white">{p.title}</h4>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-purple-200/70" />
                            <span className="text-xs text-purple-200/80">
                              {p.timeHorizon}
                            </span>
                          </div>
                        </div>

                        {/* Score pill */}
                        <div className="mb-3">
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="text-purple-200/80">
                              Decision Score
                              {isBest && (
                                <span className="ml-2 rounded bg-green-500/20 px-2 py-0.5 text-[10px] text-green-200">
                                  Best
                                </span>
                              )}
                            </span>
                            <span className="font-semibold text-white">{score}</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-black/30">
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                              style={{ width: `${Math.min(score, 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Probability */}
                        <div className="mb-4">
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="text-purple-200/80">Success Probability</span>
                            <span className="text-white">
                              {(p.probability * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-black/30">
                            <div
                              className="h-2 rounded-full bg-purple-400"
                              style={{ width: `${p.probability * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* Impact bars */}
                        <div className="space-y-2">
                          <h5 className="mb-1 text-xs font-medium text-purple-200/70">
                            Impact Areas
                          </h5>
                          {Object.entries(p.impact).map(([k, v]) => (
                            <div key={k} className="flex items-center justify-between">
                              <span className="capitalize text-xs text-purple-200/70">
                                {k}
                              </span>
                              <div className="flex items-center gap-2">
                                <div className="h-1 w-14 rounded-full bg-black/30">
                                  <div
                                    className={`h-1 rounded-full ${impactColor(v)}`}
                                    style={{ width: `${(v / 10) * 100}%` }}
                                  />
                                </div>
                                <span className="text-xs text-purple-100">{v}/10</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Expanded details */}
                        {selectedPathway === p.id && (
                          <div className="mt-5 space-y-4 border-t border-white/10 pt-4">
                            <div>
                              <h6 className="mb-2 text-sm font-medium text-green-300">
                                Benefits
                              </h6>
                              <ul className="space-y-1">
                                {p.benefits.slice(0, 4).map((b, i) => (
                                  <li
                                    key={i}
                                    className="flex items-center gap-2 text-xs text-purple-50"
                                  >
                                    <CheckCircle className="h-3 w-3 text-green-300" />
                                    {b}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h6 className="mb-2 text-sm font-medium text-red-300">
                                Risks
                              </h6>
                              <ul className="space-y-1">
                                {p.risks.slice(0, 4).map((r, i) => (
                                  <li
                                    key={i}
                                    className="flex items-center gap-2 text-xs text-purple-50"
                                  >
                                    <AlertTriangle className="h-3 w-3 text-red-300" />
                                    {r}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-purple-100">
                              <div>
                                <span className="text-yellow-300">Financial:</span>{" "}
                                {p.costs.financial}
                              </div>
                              <div>
                                <span className="text-yellow-300">Time:</span>{" "}
                                {p.costs.time}
                              </div>
                              <div>
                                <span className="text-yellow-300">Emotional:</span>{" "}
                                {p.costs.emotional}
                              </div>
                              <div>
                                <span className="text-yellow-300">Opportunity:</span>{" "}
                                {p.costs.opportunity}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Insight */}
              <section className="rounded-xl border border-purple-400/30 bg-gradient-to-r from-purple-500/15 to-pink-500/15 p-6">
                <h3 className="mb-3 flex items-center gap-2 text-lg font-medium text-white">
                  <Heart className="h-5 w-5 text-pink-300" />
                  Sage's Insight
                </h3>
                <p className="italic leading-relaxed text-purple-50">
                  "{results.sageInsight}"
                </p>
                <div className="mt-3">
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(results.sageInsight);
                      } catch {}
                    }}
                    className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy insight
                  </button>
                </div>
              </section>

              {/* Recommendations */}
              <section className="rounded-xl border border-white/10 bg-white/5 p-6">
                <h3 className="mb-4 text-lg font-medium text-white">
                  Recommended Resources
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {results.recommendations.map((rec, i) => (
                    <div key={i} className="rounded-lg border border-white/10 bg-white/5 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-purple-300" />
                        <span className="text-sm font-medium text-white">
                          {rec.title}
                        </span>
                      </div>
                      <p className="mb-1 text-xs text-purple-200/80">{rec.source}</p>
                      <p className="text-xs text-purple-100/90">{rec.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Footer actions */}
              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <div className="text-xs text-purple-200/70">
                  Saved locally • {new Date().toLocaleTimeString()}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const data = {
                        scenario,
                        timestamp: new Date().toISOString(),
                        note,
                        results,
                        weights,
                        presetId,
                      };
                      const blob = new Blob([JSON.stringify(data, null, 2)], {
                        type: "application/json",
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `brahma-simulation-${Date.now()}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20"
                  >
                    <Download className="h-4 w-4" />
                    Export JSON
                  </button>

                  <button
                    onClick={onClose}
                    className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2 text-sm font-medium text-white hover:from-purple-700 hover:to-pink-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </>
          )}

          {!isRunning && !results && (
            <div className="py-16 text-center text-purple-100/80">
              Failed to load simulation. Try again.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
