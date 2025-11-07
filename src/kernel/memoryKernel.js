/**
 * Memory Kernel - ACF Runtime Manager + Audit Logger
 * Handles Adaptive Continuity Framework (ACF) state for Triad Agents
 * - Flags: iseLevel, curiosityLevel, etc. (localStorage-backed)
 * - Audit: Immutable logging for transparency (unifies with LocalMemoryContext)
 * - Local-first with event dispatch for reactivity
 * 
 * Exports: audit, getFlags, getTriadSettings, getSafety, etc. for components/agents
 */

const KERNEL_KEY = "brahma.acf.kernel.v1";  // ACF runtime flags (e.g., curiosityLevel)
const AUDIT_KEY = "brahma.auditTrail.v1";   // Shared with LocalMemoryContext
const TRIAD_KEY = "brahma.triad.settings.v1"; // Triad-specific (curiosity, iseLevel, etc.)
const SAFETY_KEY = "brahma.safety.settings.v1"; // Safety configs (e.g., piiThreshold)

// Helper: Safe JSON parse with fallback (strict non-string skip)
const safeParse = (json, fallback = {}) => {
  if (typeof json !== 'string') return fallback; // FIX: Skip null/undefined/non-string (no JSON.parse throw)
  try { return JSON.parse(json); } catch { return fallback; }
};

// Helper: Save with audit append (immutable)
const saveWithAudit = (key, data, action, details = {}) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    // FIX: Robust parse + ensure .auditTrail array (optional chaining)
    let auditData = safeParse(localStorage.getItem(AUDIT_KEY), { auditTrail: [] });
    if (!auditData?.auditTrail || !Array.isArray(auditData.auditTrail)) {
      auditData.auditTrail = []; // Set in place (no full reset)
    }
    const auditTrail = auditData.auditTrail;
    auditTrail.push({
      timestamp: new Date().toISOString(),
      action,
      agent: "kernel",
      details: { key, ...details },
    });
    localStorage.setItem(AUDIT_KEY, JSON.stringify({ auditTrail: auditTrail.slice(-100) })); // Limit to 100
    console.log(`[Kernel] ${action}:`, details);
  } catch (e) {
    console.error("[Kernel] Save failed:", e);
  }
};

/**
 * Core Audit: Logs immutable events (e.g., flag raise, consent grant)
 * @param {string} action - e.g., 'acf_consent_granted', 'governance_flag'
 * @param {object} details - Payload (e.g., { scope: 'memory', details: '...' })
 */
export const audit = (action, details = {}) => {
  const entry = {
    timestamp: new Date().toISOString(),
    action,
    agent: "kernel",
    details,
    tags: details.tags || ['#acf', '#audit'],
    severity: details.severity || 'info', // 'info' | 'warning' | 'block'
  };
  // FIX: Robust parse + ensure .auditTrail array (optional chaining)
  let auditData = safeParse(localStorage.getItem(AUDIT_KEY), { auditTrail: [] });
  if (!auditData?.auditTrail || !Array.isArray(auditData.auditTrail)) {
    auditData.auditTrail = [];
  }
  const auditTrail = auditData.auditTrail;
  auditTrail.push(entry);
  saveWithAudit(AUDIT_KEY, { auditTrail }, action, { entries: auditTrail.length });
  // Dispatch for reactivity (e.g., UI updates)
  window.dispatchEvent(new CustomEvent('acf-audit', { detail: entry }));
  return entry;
};

/**
 * Get ACF Runtime Flags (e.g., curiosityLevel, iseLevel)
 * Defaults: { curiosityLevel: 0.5, iseLevel: 1.0, ... }
 */
export const getFlags = () => {
  const saved = safeParse(localStorage.getItem(KERNEL_KEY), {});
  const defaults = {
    curiosityLevel: 0.5,
    iseLevel: 1.0,
    ambientPresence: false,
    acEnabled: true,
    visualNarrativeEnabled: true,
    consentDriftPeriod: 90, // days
  };
  const flags = { ...defaults, ...saved };
  saveWithAudit(KERNEL_KEY, flags, 'get_flags'); // Audit access
  return flags;
};

/**
 * Update ACF Flags (e.g., set curiosityLevel)
 * @param {object} updates - Partial flags { curiosityLevel: 0.7 }
 */
export const setFlags = (updates) => {
  const current = getFlags();
  const updated = { ...current, ...updates };
  saveWithAudit(KERNEL_KEY, updated, 'set_flags', { updates });
  window.dispatchEvent(new CustomEvent('acf-flags-updated', { detail: updated }));
  return updated;
};

/**
 * Get Triad Settings (for SageJourneyOrchestrator: curiosity, ac_enabled, etc.)
 * Defaults from persisted or baseline
 */
export const getTriadSettings = () => {
  const saved = safeParse(localStorage.getItem(TRIAD_KEY), {});
  const defaults = {
    curiosityLevel: 0.5,
    iseLevel: 1.0,
    acEnabled: true, // Adaptive Continuity
    visualNarrativeEnabled: true,
    ambientPresence: false,
    // Triad-specific: e.g., for Governance/Sentinel integration
    governanceThreshold: 0.8,
    sentinelSensitivity: 'medium',
  };
  const settings = { ...defaults, ...saved };
  saveWithAudit(TRIAD_KEY, settings, 'get_triad_settings');
  return settings;
};

/**
 * Set Triad Settings
 * @param {object} updates - Partial { acEnabled: false }
 */
export const setTriadSettings = (updates) => {
  const current = getTriadSettings();
  const updated = { ...current, ...updates };
  saveWithAudit(TRIAD_KEY, updated, 'set_triad_settings', { updates });
  return updated;
};

/**
 * Get Safety Settings (e.g., PII thresholds, consent scopes)
 * Defaults: Conservative (block on high risk)
 */
export const getSafety = () => {
  const saved = safeParse(localStorage.getItem(SAFETY_KEY), {});
  const defaults = {
    piiThreshold: 0.7, // Block if >70% PII risk
    consentScopes: ['memory', 'voice', 'insights'], // Required consents
    dignityCheckEnabled: true,
    maxRetentionDays: 365,
    autoRedactPII: true,
  };
  const safety = { ...defaults, ...saved };
  saveWithAudit(SAFETY_KEY, safety, 'get_safety');
  return safety;
};

/**
 * Set Safety Settings
 * @param {object} updates - Partial { piiThreshold: 0.5 }
 */
export const setSafety = (updates) => {
  const current = getSafety();
  const updated = { ...current, ...updates };
  saveWithAudit(SAFETY_KEY, updated, 'set_safety', { updates });
  return updated;
};

/**
 * Get Full Audit Trail (shared with LocalMemoryContext)
 * Limit to recent N entries
 */
export const getAuditTrail = () => {
  // FIX: Robust parse + ensure .auditTrail array (optional chaining)
  let auditData = safeParse(localStorage.getItem(AUDIT_KEY), { auditTrail: [] });
  if (!auditData?.auditTrail || !Array.isArray(auditData.auditTrail)) {
    auditData.auditTrail = [];
  }
  return auditData.auditTrail.slice(-50);
};

/**
 * Clear Audit (user-initiated, e.g., via SettingsPanel)
 * @param {boolean} confirm - Require explicit confirm
 */
export const clearAudit = (confirm = true) => {
  if (confirm && !window.confirm("Clear all audit logs? This is irreversible.")) return;
  localStorage.removeItem(AUDIT_KEY);
  audit('audit_cleared', { reason: 'user_request' });
  window.dispatchEvent(new CustomEvent('acf-audit-cleared'));
};

/**
 * Check Consent Drift (e.g., for memory review every 90 days)
 * @param {string} scope - e.g., 'memory'
 * @param {number} periodDays - Default 90
 */
export const checkConsentDrift = (scope = 'memory', periodDays = 90) => {
  const records = getAuditTrail().filter(r => r.details.scope === scope && r.action.includes('consent'));
  if (!records.length) {
    audit('consent_drift_due', { scope, reason: 'no_records', periodDays });
    return { due: true, daysSince: 0 };
  }
  const latest = new Date(records[records.length - 1].timestamp);
  const now = new Date();
  const diffDays = (now - latest) / (1000 * 60 * 60 * 24);
  const due = diffDays > periodDays;
  if (due) {
    audit('consent_drift_due', { scope, daysSince: diffDays, periodDays });
    window.dispatchEvent(new CustomEvent('acf-drift-due', { detail: { scope } }));
  }
  return { due, daysSince: Math.floor(diffDays) };
};

/**
 * Legacy/Get Audit (for DataShadowPanel.jsx compatibility; alias to getAuditTrail)
 */
export const getAudit = getAuditTrail;

/**
 * FIX: Legacy Alias for SettingsPanel.jsx (line 29: getAuditLogs)
 */
export const getAuditLogs = getAuditTrail;

/**
 * FIX: Save Audit Log for Wisdom Memory (e.g., useWisdomMemory.jsx line 2)
 * Wraps audit with 'wisdom_memory' source; accepts action string or entry object
 * @param {string|object} actionOrEntry - e.g., 'wisdom_insert' or { category: 'growth', decisionId: 'abc' }
 * @param {object} details - Optional payload
 */
export const saveAuditLog = (actionOrEntry, details = {}) => {
  const action = typeof actionOrEntry === 'string' ? actionOrEntry : 'wisdom_memory_update';
  const payload = typeof actionOrEntry === 'object' ? actionOrEntry : details;
  return audit(action, { ...payload, source: 'wisdom_memory' });
};
