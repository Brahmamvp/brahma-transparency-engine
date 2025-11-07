import { audit } from "../../kernel/memoryKernel.js";
import { TrajectoryStance, createTrajectorySnapshot } from "./types.js";
// Assume queryMemoriesByTopic added to sageMemoryEngine

export function computeTrajectory(topic, options = { window: 30 }) {
  const rows = []; // TODO: Use getByTopic from morphology or sageMemoryEngine query
  if (!rows.length) return createTrajectorySnapshot({ stance: TrajectoryStance.Stalled, evidence: { density: 0 } });

  const scores = rows.map(r => parseFloat(r.UserOutcomeScore) || 0);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const recentTrend = scores.slice(-5).reduce((a, b) => a + b, 0) / Math.min(5, scores.length);

  let stance = TrajectoryStance.Stalled;
  if (avg >= 0.5 && recentTrend >= 1) stance = TrajectoryStance.ConfidenceUp;
  else if (avg < 0 && recentTrend < 0) stance = TrajectoryStance.Regressing;
  else if (avg >= 0.2 && recentTrend >= 0) stance = TrajectoryStance.Breakthrough;
  else if (avg < 0.2 && scores.filter(s => s < 0).length >= Math.ceil(scores.length * 0.5)) stance = TrajectoryStance.ResilienceFragile;

  const snap = createTrajectorySnapshot({ stance, evidence: { avg, trend: recentTrend, n: scores.length } });
  audit("acf_trajectory_snapshot", { topic, stance, avg: snap.evidence.avg });
  return snap;
}
