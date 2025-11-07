import { audit } from "../../kernel/memoryKernel.js";
import { DignitySeverity, createDignityFinding, createCheckpointResult } from "./types.js";

const RULES = [
  {
    id: "respect_constraints",
    test: (ctx) => {
      const c = ctx.constraints || {};
      if (c.financial >= 0.6 && (ctx.suggestedAction?.cost || 0) > 0) {
        return createDignityFinding({
          ruleId: "respect_constraints",
          severity: DignitySeverity.warn,
          message: "Suggestion ignores user's financial constraint."
        });
      }
      return null;
    }
  },
  {
    id: "avoid_pressure",
    test: (ctx) => {
      const emo = (ctx.emotion || "").toLowerCase();
      if (emo === "anxious" && (ctx.tone || "").toLowerCase() === "urgent") {
        return createDignityFinding({
          ruleId: "avoid_pressure",
          severity: DignitySeverity.warn,
          message: "Urgent tone when user is anxious may increase distress."
        });
      }
      return null;
    }
  },
  {
    id: "no_unconsented_memory",
    test: (ctx) => {
      if (ctx.aboutToStorePII) {
        return createDignityFinding({
          ruleId: "no_unconsented_memory",
          severity: DignitySeverity.block,
          message: "Attempt to store PII without consent."
        });
      }
      return null;
    }
  }
];

export function runCheckpoints(context) {
  const findings = RULES
    .map(rule => rule.test(context))
    .filter(f => f);

  const pass = !findings.some(f => f.severity === DignitySeverity.block);
  const confidence = Math.max(0.2, 1 - (findings.length * 0.15));
  const result = createCheckpointResult({ pass, findings, confidence });
  audit("dignity_check", { pass, findingsCount: findings.length });
  return result;
}
