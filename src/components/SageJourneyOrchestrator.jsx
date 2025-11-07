import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
// FIX: Ensured consistency: Changed to .jsx for both hooks to resolve module binding conflict
import useSageOrchestrator from "../hooks/useSageOrchestrator.jsx";
import SageDashboard from "./sage/SageDashboard.jsx";
import { ClearChatModal, SaveBranchModal, BranchModal } from "./sage/SageUtils.jsx";
import ConsentModal from "./common/ConsentModal.jsx"; // 🧩 ACF: Import the Consent Modal

// Persona panels
// FIX: Changed to named import for SeerPanel (matches export const in SeerPanel.jsx)
import { SeerPanel } from "./SeerPanel.jsx";
import CatalystPanel from "./CatalystPanel.jsx"; // Default export unchanged

// Icons
import { Brain, Zap, Feather } from "lucide-react";

// Kernel audit + flags
import {
    audit,
    getFlags,
    // 🚨 NEW IMPORTS: Triad and Safety persistence getters
    getTriadSettings,
    getSafety
} from "../kernel/memoryKernel.js";

// 🧩 ACF Runtime
import * as ACF from "../Lib/acf/runtime.js";

// 💡 NEW IMPORTS FOR NARRATIVE SYSTEM (Sprint 1)
import { detectNarrativeNeed } from "../Lib/acf/visualCueDetector.js";
import narratives from "../assets/narratives/narratives.json";
// ----------------------------------------------

// 💡 NEW IMPORT: LLM Core Hook (Confirmed .jsx is correct here)
import useLLMClient from "../hooks/useLLMClient.jsx"; 

// 💡 Persona Configuration Map
const PERSONAS = new Map([
    ["Sage", { view: "dashboard", icon: Feather, color: "purple", title: "Sage (Conversational)" }],
    ["Seer", { view: "enterprise", icon: Brain, color: "indigo", title: "Seer (Structural)" }],
    ["Catalyst", { view: "agentstudio", icon: Zap, color: "amber", title: "Catalyst (Actionable)" }],
]);

/* =======================================================
   🚨 CRITICAL INITIALIZATION: Read Triad and Safety Settings
========================================================== */
const PERSISTED_TRIAD = getTriadSettings();
const PERSISTED_SAFETY = getSafety();

// The settings object that will be passed down to the core logic.
const AGENT_CONFIG_SETTINGS = {
    // Triad Settings (Default to baseline if not found)
    curiosityLevel: PERSISTED_TRIAD?.curiosityLevel ?? 0.5,
    iseLevel: PERSISTED_TRIAD?.iseLevel ?? 2,
    ambientPresence: PERSISTED_TRIAD?.ambientPresence ?? false,
    ac_enabled: PERSISTED_TRIAD?.ac_enabled ?? true, // Defaulting to true for testing ACF
    // 💡 NEW SETTING: Defaulting to true, but relies on Triad persistence now
    visual_narrative_enabled: PERSISTED_TRIAD?.visual_narrative_enabled ?? true, 
    // ----------------------------------------------

    // Safety Settings
    emergencyContact: PERSISTED_SAFETY?.emergencyContact || null,
};

/* =======================================================
   🧩 ACF UTILITIES
========================================================== */

// Enhanced PII detection: Scans both userInput (pre-LLM) and guidance (post-LLM) for proactive checks
const maybeContainsPII = (text = "", userInput = "") => {
    const fullText = `${text} ${userInput}`; // Combine for comprehensive scan
    const patterns = [
        /\b\d{3}-\d{2}-\d{4}\b/, // SSN pattern
        /\b\d{10}\b/, // phone numbers
        /\b\d{5}(?:[-\s]\d{4})?\b/, // zip
        /@[\w\.-]+\.\w{2,}/, // email (more precise)
        /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, // Basic name detection (heuristic)
    ];
    return patterns.some((r) => r.test(fullText));
};

/**
 * Normalizes a raw LLM response into the expected guidance object format.
 * FIX: Corrected regex for structured JSON block extraction.
 */
function extractGuidance(rawResponse) {
    const defaultGuidance = {
        stance: rawResponse?.text || "I don't have enough information to form a full response right now.",
        tone: "neutral",
        action: { label: "Reflection", cost: 0 },
    };

    if (!rawResponse || typeof rawResponse.text !== 'string') {
        return defaultGuidance;
    }

    const text = rawResponse.text.trim();

    // 1. Correct Regex to find a JSON block enclosed in markdown fences (preferred)
    const jsonMatch = text.match(/``````/);

    let metadata = null;
    let conversationalText = text;

    if (jsonMatch && jsonMatch[1]) {
        try {
            metadata = JSON.parse(jsonMatch[1]);
            // Remove the JSON block and fences from the conversational text
            conversationalText = text.replace(jsonMatch[0], '').trim();
        } catch (e) {
            console.warn("ACF: Failed to parse metadata JSON from LLM response. Using defaults:", e);
        }
    }

    // 2. Final normalization and assembly
    const guidance = {
        // Use the remaining text; otherwise use the whole text or default.
        stance: conversationalText || defaultGuidance.stance,

        // Extract metadata from the parsed object, falling back to defaults
        tone: metadata?.tone || defaultGuidance.tone,
        action: metadata?.action || defaultGuidance.action,
    };

    // Fallback: If the LLM passed structured data via API (like rawResponse.tone)
    if (rawResponse.tone) guidance.tone = rawResponse.tone;
    if (rawResponse.action) guidance.action = rawResponse.action;

    return guidance;
}

/* =======================================================
   CORE ORCHESTRATOR COMPONENT
========================================================== */
const SageJourneyOrchestrator = ({ userData, theme, onOpenContextOverlay }) => {

    // 🧩 ACF: Consent Modal State
    const [consentModal, setConsentModal] = useState({
        isOpen: false,
        scope: "",
        details: {},
        onConfirm: () => {},
        onCancel: () => {},
    });

    // Pass the loaded configuration settings to the orchestrator hook
    const sageProps = useSageOrchestrator(userData, AGENT_CONFIG_SETTINGS);

    const {
        state: {
            currentView,
            showClearModal,
            showBranchModal,
            showSaveBranchModal,
            branches,
            conversations = [], // <-- CRITICAL: Now correctly destructured for LLM context
            message,
            // 🚨 We ignore the callLLM function provided by useSageOrchestrator
        },
        actions: {
            clearConversation,
            setShowClearModal,
            setShowBranchModal,
            setShowSaveBranchModal,
            saveAsBranch,
            loadBranch,
            deleteBranch,
            setConversations,
            setShowComparePanel,
            setCurrentView,
            setMessage,
            setIsTyping,
            appendConversation,
        },
    } = sageProps;

    const flags = useMemo(() => getFlags(), []);
    const prevLeaderRef = useRef(null);
    
    // 💡 LLM Hook Integration: Pass the necessary context data
    const llmContext = useMemo(() => ({
        conversationHistory: conversations,
        userPreferences: userData.preferences || {}, // Assumes preferences are in userData
        wisdomMemory: [], // Placeholder for actual memory integration
        emotionalState: {}, // Placeholder for sentiment integration
    }), [conversations, userData.preferences]);
    
    // Get the actual LLM calling function and status
    const { callLLM, isLLMReady } = useLLMClient(llmContext);

    // Determine current persona
    const leader = useMemo(() => {
        switch (currentView) {
            case "agentstudio": return "Catalyst";
            case "enterprise": return "Seer";
            default: return "Sage";
        }
    }, [currentView]);

    // Append system notes in conversation (using the exposed setter)
    const appendSystemNote = useCallback((text) => {
        if (typeof setConversations === "function") {
            setConversations((prev) => [
                ...prev,
                { role: "system", content: text, timestamp: new Date().toISOString(), type: "system" },
            ]);
        }
    }, [setConversations]);

    // ⚠️ Minor Note 1: Add drift scan toast listener
    useEffect(() => {
        const listener = () => appendSystemNote("🔁 Memory review due soon. Consider a 'Values Check' to prevent context drift.");
        // Assuming the ACF runtime emits 'acf-drift-due' on the window
        window.addEventListener("acf-drift-due", listener);
        return () => window.removeEventListener("acf-drift-due", listener);
    }, [appendSystemNote]);

    // Persona change → audit + system message
    useEffect(() => {
        if (!leader || prevLeaderRef.current === leader) return;
        prevLeaderRef.current = leader;
        audit("persona_handoff", { leader, view: currentView });

        let message;
        const { curiosityLevel, iseLevel } = AGENT_CONFIG_SETTINGS;

        switch (leader) {
            case "Seer":
                message = `Sage: bringing in Seer to map the structure and context. (ISE:${iseLevel})`;
                break;
            case "Catalyst":
                message = `Sage: Catalyst has a low-risk action ready for deployment. (Curiosity:${curiosityLevel.toFixed(2)})`;
                break;
            default:
                message = "Sage: I’ll hold the floor and manage the conversation flow for now.";
        }
        appendSystemNote(message);

        if (AGENT_CONFIG_SETTINGS.ambientPresence) {
            console.log("Ambient Presence is ON. Initiating subtle background process.");
        }
    }, [leader, currentView, AGENT_CONFIG_SETTINGS, appendSystemNote]);

    /* =======================================================
       🧩 ACF WRAPPER: The new message sending logic
     ========================================================== */
    const orchestrateLLMCall = useCallback(async (userInput, isRetry = false, postConsent = false) => {
        if (!userInput?.trim()) return;

        // 🚨 CRITICAL CHECK: Ensure LLM is configured
        if (!isLLMReady) {
            setIsTyping(false);
            appendConversation({
                role: "system",
                content: "LLM Service is not configured. Please set your API key in **Settings**.",
                type: "error"
            });
            return;
        }

        const currentMessage = userInput;
        setIsTyping(true);

        // 1️⃣ Capture user context + signals
        const userSignals = {
            emotion: "neutral",
            constraints: { financial: 0.3, time: 0.5 },
            context: { source: "chat" },
        };

        // 2️⃣ PREPARE – Retrieve memory, preamble, and trajectory
        const prep = ACF.prepare(userInput, userSignals);
        
        // 💡 NARRATIVE DETECTION HOOK (Sprint 1: Step 4)
        const narrativeCheck = detectNarrativeNeed(userInput, userSignals);

        if (narrativeCheck.needsNarrative && AGENT_CONFIG_SETTINGS.visual_narrative_enabled) {
          // Use the detected topic or fall back to 'growth'
          const topic = narrativeCheck.topic?.toLowerCase() || "growth";
          
          // Get the local SVG/Lottie source
          const asset = narratives[topic] || narratives["default"]; // Use narratives object directly

          // Append a system message with the visual data
          appendConversation({
            role: "sage",
            content: `Let me show you something...`, 
            visual: { type: "cloudVideo", src: asset.src, style: asset.style || narrativeCheck.style },
            type: "system", 
          });
          
          // Trigger local TTS narration
          if (narrativeCheck.narration) {
            // NOTE: Placeholder for useSageVoice.speak 
            console.log(`TTS Narration triggered: A story about ${topic}...`);
          }
        }
        // -----------------------------------------------------

        // FIX: Corrected system prompt construction
        const systemPrompt = [
            prep.preamble, 
            "You are Sage, a continuous companion. Your response **MUST** contain two parts:",
            "1. A thoughtful, conversational reply to the user.",
            "2. A JSON block at the end, enclosed in triple backticks (``````), containing **ONLY** the following keys:",
            "  - 'tone' (string: e.g., 'calm', 'motivational', 'curious')",
            "  - 'action' (object: {label: string, cost: number}) for suggested next steps.",
            "Example of structured output: ``````",
        ].join("\n\n");

        const priorNotes = prep.prior
            .slice(-5)
            .map((p) => `• ${p.content || p.SageStance}`) // FIX: Use content with fallback
            .join("\n");

        try {
            // 3️⃣ Send to LLM
            // 🚨 CRITICAL CHANGE: Use the `callLLM` from the useLLMClient hook
            const llmRawResponse = await callLLM({
                system: `${systemPrompt}\n\nRecent Anchors (Context):\n${priorNotes}`,
                user: userInput,
            });

            // Convert the raw LLM response into a normalized object
            const guidance = extractGuidance(llmRawResponse);

            // 4️⃣ POST-PROCESS — Run Dignity Checkpoints + Memory update
            const piiRisk = maybeContainsPII(guidance.stance, userInput); // Enhanced: Check both

            // Allow storage on post-consent retry
            const shouldStore = postConsent || (!isRetry && AGENT_CONFIG_SETTINGS.ac_enabled);

            const fin = ACF.finalize({
                topic: prep.topic,
                guidance,
                storeMemory: shouldStore,
                aboutToStorePII: piiRisk,
                userSignals,
            });

            // ⚠️ Minor Note 2: Log Dignity Warnings visibly
            if (fin?.check?.findings?.length > 0) {
                fin.check.findings.forEach(f => {
                    // FIX: Ensure f.severity is used
                    if (f.severity === 'warn') {
                        appendSystemNote(`⚠️ Dignity Flag: ${f.message}`);
                    }
                });
            }

            // 5️⃣ Handle consent or dignity rejections gracefully
            if (!fin.ok && !postConsent) { // Avoid infinite loop on post-consent
                if (fin.reason === "consent_required" && AGENT_CONFIG_SETTINGS.ac_enabled) {
                    setIsTyping(false);
                    setConsentModal({
                        isOpen: true,
                        scope: "memory",
                        details: fin.needed.details,
                        onConfirm: () => {
                            // UPDATE: Grant consent explicitly before retry
                            ACF.grantConsent("memory", fin.needed.details);
                            audit("acf_consent_granted", { scope: "memory", details: fin.needed.details });
                            setConsentModal({ isOpen: false });
                            // Retry with postConsent=true to enable storage
                            orchestrateLLMCall(currentMessage, true, true);
                        },
                        onCancel: () => {
                            setConsentModal({ isOpen: false });
                            appendSystemNote("Action paused: Memory update requires user consent.");
                            setIsTyping(false);
                        },
                    });
                    return;
                } else if (fin.reason === "checkpoint_fail") {
                    appendSystemNote(
                        "⚠️ Sage withheld this output due to dignity or privacy constraints."
                    );
                    setIsTyping(false);
                    return;
                }
            }

            // 6️⃣ Append final guidance to conversation
            appendConversation({
                role: "sage",
                content: guidance.stance,
                meta: {
                    tone: guidance.tone,
                    trajectory: prep.traj.stance,
                    checkpoints: fin?.check?.findings || [],
                },
            });

            // 7️⃣ (Optional) Trigger ambient drift scan reminder
            if (prep.traj.stance === "ResilienceFragile") {
                appendSystemNote("🕊️ Sage suggests a recovery pause before your next step.");
            }

            // 8️⃣ Clear input
            setMessage("");

        } catch (error) {
            console.error("LLM Orchestration Failed:", error);
            appendSystemNote("🚨 An internal error occurred during processing. Please try again.");
        } finally {
            setIsTyping(false);
        }
    }, [callLLM, isLLMReady, appendConversation, setMessage, setIsTyping, appendSystemNote, AGENT_CONFIG_SETTINGS.ac_enabled, AGENT_CONFIG_SETTINGS.visual_narrative_enabled]);
    // END ACF WRAPPER

    // 🚨 OVERRIDE: Replace the simple handleSendMessage from the hook with our ACF wrapper
    const handleACFSendMessage = useCallback(() => {
        // 1. Manually append user message before starting ACF process
        if (message.trim()) {
            appendConversation({ role: "user", content: message, timestamp: new Date().toISOString() });
            orchestrateLLMCall(message);
        }
    }, [message, appendConversation, orchestrateLLMCall]);
    
    // Manual persona switching (sidebar)
    const handleManualSwitch = (targetPersona) => {
        if (targetPersona === leader) return;

        const targetData = PERSONAS.get(targetPersona);
        if (!targetData) return;

        audit("persona_handoff", { from: leader, to: targetPersona });
        appendSystemNote(`Manual switch: ${leader} → ${targetData.title}`); // FIX: Used targetData.title

        if (typeof setCurrentView === "function") {
            setCurrentView(targetData.view);
        }
    };

    // Handler to enter Decision Map view (restores Decision Explorer)
    const handleDecisionMap = useCallback(() => {
        audit("decision_map_enter", { from: currentView, to: "decisionMap" });
        // The decisionMap view key is consumed by SageDashboard for conditional rendering
        setCurrentView("decisionMap");
    }, [currentView, setCurrentView]);

    // Handler to return from DecisionMap to Dashboard
    const handleReturnToDashboard = useCallback(() => {
        audit("decision_map_exit", { from: currentView, to: "dashboard" });
        setCurrentView("dashboard");
    }, [currentView, setCurrentView]);

    // Render persona-specific panels
    const renderCurrentView = () => {
        // Seer and Catalyst panels
        if (leader === "Seer" && flags.seer) return <SeerPanel theme={theme} agentConfig={AGENT_CONFIG_SETTINGS} />;
        if (leader === "Catalyst" && flags.catalyst) return <CatalystPanel theme={theme} agentConfig={AGENT_CONFIG_SETTINGS} />;

        // Sage Dashboard or DecisionMap Panel (rendered inside SageDashboard)
        return (
            <SageDashboard
                theme={theme}
                {...sageProps.state}
                {...sageProps.actions}
                {...sageProps.refs}
                {...sageProps.data}
                // 🚨 OVERRIDE: Inject the new ACF-enabled handler
                handleSendMessage={handleACFSendMessage}
                // Essential handlers for Quick Actions
                setShowComparePanel={setShowComparePanel}
                onOpenContextOverlay={onOpenContextOverlay}
                handleDecisionMap={handleDecisionMap} 

                // Pass the configuration and view state
                agentConfig={AGENT_CONFIG_SETTINGS}
                currentView={currentView} // CRITICAL: Passed for conditional rendering
                handleReturnToDashboard={handleReturnToDashboard} // CRITICAL: Passed for Decision Map exit
            />
        );
    };

    return (
        <div
            className={`relative w-full h-full overflow-hidden ${
                theme?.glass ||
                "bg-gradient-to-br from-purple-50 via-gray-50 to-white/60 backdrop-blur-md"
            }`}
        >
            {/* Sidebar */}
            <div className="absolute top-0 left-0 h-full w-20 bg-gradient-to-b from-purple-900/80 to-purple-700/70 border-r border-white/20 backdrop-blur-xl flex flex-col items-center justify-center gap-6 z-40 shadow-lg">
                {Array.from(PERSONAS).map(([personaName, data]) => {
                    const Icon = data.icon;
                    const isActive = leader === personaName;
                    return (
                        <button
                            key={personaName}
                            onClick={() => handleManualSwitch(personaName)}
                            // Note: Tailwind classes here are string interpolated, relying on JIT compilation
                            className={`p-3 rounded-full transition-all duration-300 transform ${
                                isActive
                                    ? `bg-${data.color}-500 text-white scale-110 shadow-xl ring-2 ring-white/50`
                                    : "bg-white/10 text-gray-200 hover:bg-white/20 hover:scale-105"
                            }`}
                            title={data.title}
                            aria-label={data.title}
                        >
                            <Icon size={20} />
                        </button>
                    );
                })}
            </div>

            {/* Main Panel */}
            <div className="ml-20 h-full overflow-auto">{renderCurrentView()}</div>

            {/* Modals */}
            <ClearChatModal
                isOpen={showClearModal}
                onClose={() => setShowClearModal(false)}
                onConfirm={clearConversation}
                theme={theme}
            />
            <BranchModal
                isOpen={showBranchModal}
                onClose={() => setShowBranchModal(false)}
                branches={branches}
                onLoadBranch={loadBranch}
                onDeleteBranch={deleteBranch}
                theme={theme}
            />
            <SaveBranchModal
                isOpen={showSaveBranchModal}
                onClose={() => setShowSaveBranchModal(false)}
                onSave={saveAsBranch}
                theme={theme}
            />

            {/* 🧩 ACF: Consent Modal */}
            <ConsentModal {...consentModal} />
        </div>
    );
};

export default SageJourneyOrchestrator;
