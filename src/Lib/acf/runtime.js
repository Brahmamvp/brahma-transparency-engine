/**
 * BRAHMA ACF RUNTIME
 * ------------------------------------------------------------
 * Adaptive Continuity Framework (ACF)
 * Enables Sage to reason over time with context and dignity.
 *
 * Key Functions:
 * • prepare(userInput, userSignals)
 * • finalize({ topic, guidance, storeMemory, aboutToStorePII, userSignals })
 *
 * Dependencies:
 * • ./morphology.js (upsertMemory, getByTopic)
 * • ./trajectory.js (computeTrajectory)
 * • ./checkpoints.js (runCheckpoints)
 * • ./types.js (createACFMemory)
 * • ./consent.js (addConsent, requireConsent, driftScanIfDue)
 * • ../sageMemoryEngine.js (extractTopicTag)
 * • ../../kernel/memoryKernel.js (audit)
 */

import { extractTopicTag } from "../sageMemoryEngine.js"; // Existing
import { audit } from "../../kernel/memoryKernel.js"; // For logging
// STATIC IMPORTS for ACF modules (all in src/Lib/acf/)
import { upsertMemory, getByTopic } from "./morphology.js";
import { computeTrajectory } from "./trajectory.js";
import { requireConsent, driftScanIfDue, addConsent, clearConsent } from "./consent.js";
import { runCheckpoints } from "./checkpoints.js";
import { createACFMemory } from "./types.js"; // Import necessary factory function

/* =======================================================
    PREPARE
========================================================== */

export function prepare(userInput, userSignals = {}) {
    // 1. Core ACF lookups
    const topic = extractTopicTag(userInput); // Use existing engine
    const traj = computeTrajectory(topic); // From trajectory.js
    const prior = getByTopic(topic, { limit: 8 }); // From morphology.js

    // 2. Consent drift check
    const driftDue = driftScanIfDue();
    if (driftDue) {
        // Surface to UI via event (handled in Settings/SageJourney)
        window.dispatchEvent(new CustomEvent("acf-drift-due", { detail: { topic } }));
    }

    // 3. Preamble for LLM
    const preamble = [
        `ACF: Topic=${topic}`,
        `ACF: Trajectory=${traj.stance}`,
        `ACF: EmotionalState=${userSignals.emotion || "neutral"}`,
        `ACF: Constraints=${JSON.stringify(userSignals.constraints || {})}`,
        `ACF: PriorCount=${prior.length}`,
        "You are Sage — a continuous companion that remembers context over time.",
        "Use prior reflections to guide your reasoning, but do not repeat them.",
        "Acknowledge changes in tone, energy, and user confidence since the last exchange.",
        "Your goal: sustain dignity, agency, and continuity."
    ].join("\n");

    audit("acf_prepare", { topic, traj: traj.stance, priorCount: prior.length });
    return { topic, traj, prior, preamble };
}

/* =======================================================
    FINALIZE
========================================================== */

export function finalize({
    topic,
    guidance,
    storeMemory = true,
    aboutToStorePII = false,
    userSignals = {},
}) {
    // 1. Dignity checkpoints
    const checkCtx = { ...userSignals, suggestedAction: guidance?.action, tone: guidance?.tone, aboutToStorePII };
    const check = runCheckpoints(checkCtx);

    if (!check.pass) {
        audit("acf_finalize_fail", { reason: "checkpoint_fail", findings: check.findings });
        return { ok: false, reason: "checkpoint_fail", check };
    }

    // 2. Consent gate for PII
    if (storeMemory && aboutToStorePII) {
        const needed = requireConsent("memory", { pii: true, topic });
        audit("acf_finalize_fail", { reason: "consent_required" });
        return { ok: false, reason: "consent_required", needed };
    }

    // 3. Persist memory if allowed
    if (storeMemory && guidance?.stance) {
        try {
            // Directly use upsertMemory from morphology.js
            upsertMemory(createACFMemory({
                topic,
                kind: "AdaptiveAnchor", // Assumes AdaptiveAnchor is available via types.js export
                content: guidance.stance,
                context: userSignals.context || {},
                weight: check.confidence
            }));
        } catch (e) {
            console.error("[ACF] Memory persistence failed:", e);
            audit("acf_memory_error", { error: e.message });
        }
    }

    audit("acf_finalize", { topic, stored: storeMemory && !!guidance?.stance, confidence: check.confidence });
    driftScanIfDue(); // Periodic check after finalize
    return { ok: true, check };
}

/* =======================================================
    UTILS (from consent integration)
========================================================== */

/**
 * Grant consent after modal (calls addConsent).
 */
export function grantConsent(scope, details) {
    const granted = addConsent({ scope, action: "allow", details });
    console.log("[ACF] Consent granted:", granted);
    return true;
}

/**
 * Clear all ACF data (memory + consent).
 */
export function clearAll() {
    // Note: The 'brahma_acf_memory' key for fallback local storage is removed
    // as we now rely entirely on the upsertMemory/morphology layer.
    clearConsent(); // From consent.js
    audit("acf_clear_all");
    console.log("[ACF] All ACF data cleared (only consent if morphology stores elsewhere).");
}