// Minimal JS "types" for ACF - extendable, no TS required
export const MemoryKind = {
  Fleeting: "Fleeting",
  AdaptiveAnchor: "AdaptiveAnchor",
  Legacy: "Legacy",
  Meta: "Meta"
};

export const TrajectoryStance = {
  ConfidenceUp: "ConfidenceUp",
  ResilienceFragile: "ResilienceFragile",
  Stalled: "Stalled",
  Regressing: "Regressing",
  Breakthrough: "Breakthrough"
};

export const DignitySeverity = {
  info: "info",
  warn: "warn",
  block: "block"
};

// Interfaces as factory functions for validation
export function createACFMemory(partial = {}) {
  return {
    id: partial.id || `acf-${Date.now()}`,
    topic: partial.topic || "",
    kind: partial.kind || MemoryKind.Fleeting,
    content: partial.content || "",
    createdAt: partial.createdAt || new Date().toISOString(),
    updatedAt: partial.updatedAt || new Date().toISOString(),
    ttl: partial.ttl,
    weight: partial.weight || 1.0,
    identity: partial.identity,
    context: partial.context,
    source: partial.source || "system",
    redactions: partial.redactions || []
  };
}

export function createTrajectorySnapshot(partial = {}) {
  return {
    t: partial.t || new Date().toISOString(),
    stance: partial.stance || TrajectoryStance.Stalled,
    evidence: partial.evidence || {}
  };
}

export function createConsentRecord(partial = {}) {
  return {
    id: partial.id || `consent-${Date.now()}`,
    createdAt: partial.createdAt || new Date().toISOString(),
    scope: partial.scope || "memory",
    action: partial.action || "deny",
    details: partial.details || {}
  };
}

export function createDignityFinding(partial = {}) {
  return {
    ruleId: partial.ruleId || "",
    severity: partial.severity || DignitySeverity.info,
    message: partial.message || "",
    signals: partial.signals || {}
  };
}

export function createCheckpointResult(partial = {}) {
  return {
    pass: partial.pass !== undefined ? partial.pass : true,
    findings: partial.findings || [],
    confidence: partial.confidence || 1.0
  };
}
