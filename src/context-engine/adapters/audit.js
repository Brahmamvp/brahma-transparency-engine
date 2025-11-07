// src/context-engine/adapters/audit.js
import { audit } from '../../utils/auditTrail.js';

export const auditContext = (event, payload = {}) => {
  try {
    audit(`context_${event}`, payload);
  } catch (e) {
    console.warn('auditContext failed:', e);
  }
};