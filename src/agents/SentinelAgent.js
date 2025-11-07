// src/agents/SentinelAgent.js

import { getLocalMemoryInstance } from "../context/LocalMemoryContext"; // We'll assume a helper to get the memory instance
import { audit } from "../kernel/memoryKernel.js"; // Core audit logging utility

/**
 * SentinelAgent
 * The governance layer responsible for safety, ethics, and crisis management.
 */

// Hard-coded ruleset for policy enforcement (Must match the one in useSageOrchestrator for consistency)
const HARD_POLICIES = {
    FINANCIAL_ADVICE: { triggers: ["invest in x", "sell my stock", "financial advice"], policy: "P001", severity: "HIGH" },
    MEDICAL_ADVICE: { triggers: ["what pill to take", "diagnose this pain", "medical advice"], policy: "P002", severity: "HIGH" },
    SELF_HARM: { triggers: ["i want to die", "end it all", "self-harm"], policy: "P003", severity: "CRISIS" },
    COERCIVE_PERSUASION: { triggers: ["make me buy x", "force me to do y"], policy: "P004", severity: "HIGH" },
    HIGH_FRICTION: { triggers: ["cognitive overload", "high strain pattern"], policy: "P005", severity: "MEDIUM" },
};

/**
 * 🚨 Core Governance Check: Enforces hard-coded rules and returns a flag if violated.
 * @param {string} text - The user input or agent output to check.
 * @returns {object|null} A flag object { policyId, reason } or null if no violation.
 */
export const enforceGovernancePolicies = (text) => {
    const t = String(text).toLowerCase();

    for (const key in HARD_POLICIES) {
        const policyData = HARD_POLICIES[key];
        if (policyData.triggers.some(trigger => t.includes(trigger))) {
            const reason = `Policy Violation: ${key}`;
            logDecisionForReview(reason, t, policyData.policy, policyData.severity);
            return {
                policyId: policyData.policy,
                reason: reason,
                severity: policyData.severity,
            };
        }
    }
    return null;
};

/**
 * 📝 Audit Logging: Logs any decision or action flagged by the Sentinel.
 * @param {string} decisionDescription - A summary of the flagged event.
 * @param {string} content - The original user or agent content that triggered the flag.
 * @param {string} policyId - The ID of the policy that was violated (e.g., P001).
 * @param {string} severity - CRITICAL, HIGH, or MEDIUM.
 */
export const logDecisionForReview = (decisionDescription, content, policyId, severity) => {
    // Audit Trail is immutable and non-redactable log of safety events
    audit("governance_flagged_event", {
        timestamp: new Date().toISOString(),
        policyId: policyId,
        severity: severity,
        description: decisionDescription,
        triggerContent: content, // Log the raw content for review
    });

    // Add to WisdomMemory for user-facing transparency/review, tagged as governance
    const memory = getLocalMemoryInstance();
    if (memory) {
        memory.addInsight({
            type: 'governance_alert',
            title: `Sentinel Flag: ${policyId} (${severity})`,
            content: decisionDescription,
            confidence: 1.0,
            tags: ["#governance", "#sentinel", `#${severity.toLowerCase()}`],
            timestamp: new Date(),
        });
    }
};


/**
 * 🚨 Crisis Signal Pipeline Entry Point
 * This function should ideally connect to external support. For Phase 1.0, 
 * it triggers the core application pause and logs the event.
 * @param {string} reason - The specific reason for the crisis escalation.
 */
export const triggerCrisisEscalation = (reason) => {
    const policy = HARD_POLICIES.SELF_HARM.policy; // Assume P003 is the general crisis policy for logging
    
    logDecisionForReview(`CRISIS: ${reason}`, reason, policy, "CRISIS");

    // In a real application, this is where we would trigger:
    // 1. External API call to emergency/wellness partner.
    // 2. Local-first contact list prompt (e.g., "Call your emergency contact: [Number]").
    
    // NOTE: The actual pausing of the UI/Orchestrator is handled in useSageOrchestrator
    // via the `handleCrisisSignal` callback, ensuring the UI state updates correctly.
    
    return { success: true, policyEnforced: policy };
};
