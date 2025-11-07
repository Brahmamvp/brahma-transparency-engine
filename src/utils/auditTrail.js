// src/utils/auditTrail.js
let auditLog = [];

// Load from localStorage on boot
try {
  const saved = localStorage.getItem('brahma-audit-trail');
  if (saved) auditLog = JSON.parse(saved);
} catch (e) {
  console.warn("Failed to load audit trail:", e);
}

export const appendAudit = (entry) => {
  const timestamped = {
    ...entry,
    timestamp: new Date().toISOString(),
    hash: btoa(JSON.stringify(entry) + Date.now()) // simple hash
  };
  auditLog.push(timestamped);
  try {
    localStorage.setItem('brahma-audit-trail', JSON.stringify(auditLog));
  } catch (e) {
    console.error("Audit save failed:", e);
  }
  return timestamped;
};

export const getAuditLog = () => [...auditLog];

export const clearAuditLog = () => {
  auditLog = [];
  localStorage.removeItem('brahma-audit-trail');
};

export const exportAuditTrail = () => {
  const data = {
    system: "Brahma Vault SOLACE v5.0",
    exportedAt: new Date().toISOString(),
    entries: getAuditLog()
  };
  const filename = `brahma-audit-trail-${Date.now()}.json`;
  // Reuse your exporter
  import('./exporters.js').then(mod => mod.exportJSON(filename, data));
};