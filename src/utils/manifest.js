// src/utils/manifest.js
/**
 * SOLACE v5.0 — System Manifest & Audit Trail
 * Version: September 11, 2025
 */

import { v4 as uuidv4 } from "uuid";

/**
 * Generate a full system manifest
 */
export const exportManifest = (state, userData) => {
  const manifest = {
    version: "SOLACE v5.0",
    timestamp: new Date().toISOString(),
    build: "2025-09-11T00:00:00Z",
    user: {
      id: userData.id || "anonymous",
      sage: userData.sage || { form: "orb", emotion: "peaceful" },
    },
    system: {
      hasLifetimePrivacy: state.hasLifetimePrivacy || false,
      mode: state.mode || "reflect",
      theme: state.settings?.theme || "dark",
      reducedMotion: state.settings?.reducedMotion || false,
      showParticles: state.settings?.showParticles !== false,
    },
    modules: {
      decisionExplorer: state.currentView === "transparency",
      orchestrator: state.currentView === "orchestrator",
      intelligence: state.currentView === "intelligence",
      temporal: state.currentView === "temporal",
      avatar: state.currentView === "avatar",
      language: state.currentView === "language",
      memory: state.currentView === "memory",
      artifacts: state.currentView === "artifacts",
      translate: state.currentView === "translate",
      enterprise: state.currentView === "enterprise",
      agentstudio: state.currentView === "agentstudio",
    },
    agents: {
      active: state.currentAgent || "sage",
      mode: state.currentMode || "reflect",
      model: state.currentModel || "claude-3-opus",
      availableAgents: state.availableAgents || ["sage", "witness", "strategist", "valuator", "shadow"],
      availableModes: state.availableModes || ["reflect", "plan", "create", "analyze"],
      availableModels: state.availableModels || ["claude-3-opus", "gpt-4-turbo", "llama-3-70b"],
    },
    memory: {
      conversations: state.conversations?.length || 0,
      pinned: state.pinnedOptions?.length || 0,
      branches: state.branches?.length || 0,
      currentBranch: state.currentBranch || "main",
    },
    security: {
      sentinelActive: true,
      ghostScanCapable: true,
      localOnly: true,
      encryptedSync: state.settings?.encryptedSync || false,
    },
    audit: {
      actionsLogged: true,
      exportable: true,
      redactable: true,
    },
  };

  return manifest;
};

/**
 * Export full audit trail
 */
export const exportAuditTrail = (auditLog = []) => {
  return {
    version: "SOLACE v5.0 Audit",
    exportedAt: new Date().toISOString(),
    totalEntries: auditLog.length,
    entries: auditLog.map(entry => ({
      id: entry.id || uuidv4(),
      timestamp: entry.timestamp || new Date().toISOString(),
      actor: entry.actor || "user",
      action: entry.action || "unknown",
      target: entry.target || null,
      model: entry.model || null,
      mode: entry.mode || null,
      branch: entry.branch || "main",
      metadata: entry.metadata || {},
      redacted: entry.redacted || false,
    })),
  };
};

/**
 * Redact sensitive data from any object
 */
export const redactSensitive = (obj, keys = ["email", "phone", "address", "ssn", "password"]) => {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(item => redactSensitive(item, keys));
  
  const redacted = { ...obj };
  for (const key of Object.keys(redacted)) {
    if (keys.some(k => key.toLowerCase().includes(k))) {
      redacted[key] = "[REDACTED]";
    } else if (typeof redacted[key] === "object") {
      redacted[key] = redactSensitive(redacted[key], keys);
    }
  }
  return redacted;
};