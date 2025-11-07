/**
 * BRAHMA ACF CONSENT LIBRARY
 * ------------------------------------------------------------
 * Handles all consent-related storage, review, and drift-scan logic
 * for the Adaptive Continuity Framework (ACF).
 *
 * Used by:
 *   • SettingsPanel.jsx
 *   • SageJourneyOrchestrator.jsx
 *   • ACF runtime modules
 */

import { audit } from "../../kernel/memoryKernel.js"; // Import for logging

const CONSENT_KEY = "brahma_consent_records.v1"; // Updated key for versioning

/**
 * Create a simple consent record (stub for types.js; extend later).
 */
function createConsentRecord(partial = {}) {
  return {
    id: partial.id || `consent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: partial.createdAt || new Date().toISOString(),
    scope: partial.scope || "memory",
    action: partial.action || "deny",
    details: partial.details || {}
  };
}

/**
 * Load existing consent entries from localStorage.
 * Each record: { id, scope, action, details, createdAt }
 */
export function getConsent() {
  try {
    const json = localStorage.getItem(CONSENT_KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.error("[ACF] Failed to parse consent records:", e);
    audit("consent_parse_error", { error: e.message });
    return [];
  }
}

/**
 * Save the full consent record list back to storage.
 */
function saveConsent(records) {
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(records));
  } catch (e) {
    console.error("[ACF] Failed to save consent records:", e);
    audit("consent_save_error", { error: e.message });
  }
}

/**
 * Append a new consent entry (spec: addConsent).
 */
export function addConsent(recPartial) {
  const rec = createConsentRecord(recPartial);
  const all = getConsent();
  all.push(rec);
  saveConsent(all);
  audit("consent_update", rec);
  console.log("[ACF] Consent added:", rec);
  return rec;
}

/**
 * Require consent for a scope; returns object if needed (spec format).
 */
export function requireConsent(scope, details = {}) {
  const needed = { scope, details, needed: true };
  audit("consent_required", { scope, details });
  console.log("[ACF] Consent required:", needed);
  return needed;
}

/**
 * Delete all consent records (used during account reset or full wipe).
 */
export function clearConsent() {
  try {
    localStorage.removeItem(CONSENT_KEY);
    audit("consent_cleared");
    console.log("[ACF] All consent records cleared.");
  } catch (e) {
    console.error("[ACF] Failed to clear consent records:", e);
    audit("consent_clear_error", { error: e.message });
  }
}

/**
 * driftScanIfDue()
 * ------------------------------------------------------------
 * Used by SettingsPanel to determine whether a consent review
 * is due (e.g., every 90 days). Filters by memory scope.
 *
 * Returns true if a drift scan is due, false otherwise.
 * Optionally dispatches a DOM event "acf-drift-due" when due.
 */
export function driftScanIfDue({ periodDays = 90 } = {}) {
  const records = getConsent();
  const memoryRecords = records.filter(r => r.scope === "memory");
  if (!memoryRecords.length) {
    audit("consent_drift_scan_due", { periodDays, reason: "no_records" });
    window.dispatchEvent(new CustomEvent("acf-drift-due"));
    return true;
  }

  const latest = new Date(memoryRecords[memoryRecords.length - 1].createdAt);
  const now = new Date();
  const diffDays = Math.floor((now - latest) / (1000 * 60 * 60 * 24));

  if (diffDays >= periodDays) {
    audit("consent_drift_scan_due", { periodDays, daysSince: diffDays });
    console.log(`[ACF] Drift scan due (last memory consent ${diffDays} days ago).`);
    window.dispatchEvent(new CustomEvent("acf-drift-due"));
    return true;
  }

  console.log(`[ACF] No drift scan required. (${diffDays}/${periodDays} days)`);
  return false;
}
