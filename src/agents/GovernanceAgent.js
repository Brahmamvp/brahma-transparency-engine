// src/agents/GovernanceAgent.js
import governanceConfig from '../config/governance.json';
import { appendAudit } from '../utils/auditTrail.js';

class GovernanceAgent {
  constructor(logger, sentinelAgent) {
    this.name = 'GovernanceAgent';
    this.version = governanceConfig.version;
    this.logger = logger;
    this.sentinelAgent = sentinelAgent;
  }

  static fetchPolicies() {
    return governanceConfig.policies;
  }

  reviewFlaggedDecision(flagPayload) {
    console.log(`[${this.name}] Flag: ${flagPayload.decisionId}`);

    appendAudit({
      action: "flag_decision",
      decisionId: flagPayload.decisionId,
      reason: flagPayload.reason,
      userId: "local-user"
    });

    if (flagPayload.reason.toLowerCase().includes('harm') || 
        flagPayload.reason.toLowerCase().includes('crisis')) {
      this.routeToSentinel(flagPayload);
    }
  }

  routeToSentinel(eventPayload) {
    appendAudit({
      action: "crisis_escalation",
      trigger: eventPayload.reason,
      decisionId: eventPayload.decisionId
    });
    this.sentinelAgent.triggerCrisisPipeline(eventPayload);
  }

  // NEW: DELETE ADVICE
  async deleteAdvice(adviceId, conversations, setConversations) {
    const entry = {
      action: "delete_advice",
      adviceId,
      timestamp: new Date().toISOString(),
      userConfirmed: true
    };

    appendAudit(entry);

    // 1. Remove from UI
    setConversations(prev => prev.filter(msg => 
      !(msg.role === 'sage' && msg.adviceId === adviceId)
    ));

    // 2. Redact from memory (stub — plug in memoryKernel later)
    try {
      const memory = JSON.parse(localStorage.getItem('brahma-memory') || '{}');
      if (memory.advice && memory.advice[adviceId]) {
        delete memory.advice[adviceId];
        localStorage.setItem('brahma-memory', JSON.stringify(memory));
      }
    } catch (e) {
      console.warn("Memory redaction failed:", e);
    }

    return entry;
  }

  getPolicyById(id) {
    return GovernanceAgent.fetchPolicies().find(p => p.id === id);
  }
}

// Keep mocks for now
const MockSentinelAgent = {
  triggerCrisisPipeline: (payload) => {
    alert(`CRISIS: Sentinel triggered. Decision: ${payload.decisionId}`);
  }
};

const MockLogger = { 
  log: (payload) => console.log("[WisdomMemory] Logged:", payload)
};

const agent = new GovernanceAgent(MockLogger, MockSentinelAgent);
export default agent;