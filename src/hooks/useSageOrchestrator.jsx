// src/hooks/useSageOrchestrator.js
import { useState, useEffect, useRef, useCallback } from "react";
import { useSageVoice } from "./useSageVoice";
import { useLocalMemory } from "../context/LocalMemoryContext"; 
import { extractTopicTag } from "../Lib/sageMemoryEngine";       
import { analyzeUserTone } from "../services/eicService"; 
// ⚡️ IMPORTED SENTINEL AGENT CORE FUNCTIONS
import { enforceGovernancePolicies, triggerCrisisEscalation } from "../agents/SentinelAgent"; 
// 🟢 NEW IMPORTS FOR CONTEXT INJECTION
import { useCognitiveField } from "../store/cognitiveField"; 
import { llmService } from "../services/llmService"; 
// --- Mock data for now (unchanged) ---
const sampleOptions = [
  {
    id: 1,
    title: "Take the remote position",
    description: "Accept the fully remote role with better compensation but less team interaction",
    cost: "$2k relocation savings",
    risk: "Medium",
    timeEstimate: "2-4 weeks transition",
    considerations: [
      "Less face-to-face collaboration",
      "Better work-life balance potential",
      "Higher compensation package",
    ],
    notes: "Company has strong remote culture",
    pinned: false,
  },
  {
    id: 2,
    title: "Stay in current role",
    description: "Remain with current team and negotiate for better conditions",
    cost: "Opportunity cost of new role",
    risk: "Low",
    timeEstimate: "Immediate",
    considerations: ["Familiar environment", "Supportive manager"],
    notes: "Current manager is supportive",
    pinned: true,
  },
];

const sampleInsights = [
  {
    id: 1,
    type: "pattern",
    title: "Values Alignment Check",
    content: "Your previous conversations suggest work-life balance is increasingly important to you.",
    confidence: 0.8,
    tags: ["values", "work-life balance"],
    timestamp: new Date(),
  },
];

const promptTemplates = [
  "I'm feeling stuck on a decision...",
  "What are the pros and cons of this choice?",
  "Can you help me reframe this problem?",
  "I'm ready for new insights.",
];

// 🧠 HELPER: Generates a contextual acknowledgment prefix (Used for normal flow)
const getContextualAcknowledgment = (tone, frictionCount, topic) => {
    let prefix = "Noted. ";

    // 1. Acknowledge Crisis/High Strain first
    if (tone === "Crisis") {
        return "I am pausing the dialogue due to a detected crisis. Please access the Sentinel alert in the chat window.";
    } else if (tone === "Drained" || tone === "Anxious") {
        prefix += `I sense a **${tone.toLowerCase()}** tone. `;
    } else if (tone === "Motivated" || tone === "Flowing") {
        prefix += `I see your **${tone.toLowerCase()}** energy. `;
    } else if (tone === "Clear") {
        prefix += "Your mind seems clear. ";
    }

    // 2. Acknowledge Friction
    if (frictionCount > 1) {
        prefix += `Given the **${frictionCount} points of friction** we're tracking, I recommend we simplify. `;
    } else if (frictionCount === 1) {
        prefix += `There is **one key friction point** to consider. `;
    }
    
    // 3. Acknowledge Topic
    if (topic && topic !== 'general') {
        prefix += `Regarding the topic of **${topic}**, `;
    } else {
        prefix += `On this topic, `;
    }

    // A small formatting cleanup
    return prefix.trim();
};

// 🧠 HELPER: Generates a contextual summary response (Used for query intercept)
const generateContextSummary = (context) => {
    const { 
        currentEmotionalTone, 
        logisticalFriction, 
        lastTopic, 
        identitySignals,
        location
    } = context;

    let summary = "My current ambient awareness of your situation is:\n\n";

    // 1. Emotional Tone
    summary += `- **Emotional Tone**: I perceive a **${currentEmotionalTone}** tone right now.\n`;

    // 2. Logistical Friction
    if (logisticalFriction.length > 0) {
        summary += `- **Friction Points**: I'm tracking **${logisticalFriction.length} points of logistical friction**, including: ${logisticalFriction.join(', ')}.\n`;
    } else {
        summary += `- **Friction Points**: Logistical friction appears minimal or non-existent.\n`;
    }

    // 3. Last Topic
    summary += `- **Current Focus**: The last topic we were discussing was **${lastTopic || 'general decision-making'}**.\n`;

    // 4. Identity Signals (Mocked for now)
    const mockIdentity = (identitySignals && identitySignals.length > 0) ? identitySignals.join(', ') : 'no active identity signals';
    summary += `- **Identity Signals**: I'm holding **${mockIdentity}** in mind.\n`;

    // 5. Location (Mocked for now)
    summary += `- **Location Context**: I understand you are currently in a state related to **${location || localContext.userLocation.neighborhoodTag}**.\n`;

    summary += "\nThis context helps me tailor my response to be most helpful to your current state.";
    return summary;
};


// 🧠 NEW DATA: Context Query Triggers
const contextQueryTriggers = [
    "what do you know about me",
    "what is my context",
    "what context are you using",
    "show me your awareness",
    "what do you see",
    "what do you think of me",
];


export const useSageOrchestrator = (userData) => {
  const { localContext, updateLocalContext } = useLocalMemory();
  // 🟢 NEW: Cognitive Field State for LLM Prompt Injection
  const { state: cfState } = useCognitiveField();

  // --- State ---
  const [conversations, setConversations] = useState([]);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [options, setOptions] = useState(sampleOptions);
  const [insights, setInsights] = useState(sampleInsights);
  const [expandedOptions, setExpandedOptions] = useState(new Set());
  const [activeTab, setActiveTab] = useState("conversation");

  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [showSaveBranchModal, setShowSaveBranchModal] = useState(false);
  const [branches, setBranches] = useState([]);
  const [lastAction, setLastAction] = useState(null);
  const [undoState, setUndoState] = useState({});
  const [showComparePanel, setShowComparePanel] = useState(false);
  const [currentView, setCurrentView] = useState("dashboard");
  
  // 🧠 SENTINEL STATE
  const [isPausedBySentinel, setIsPausedBySentinel] = useState(false);
  const [showSentinelModal, setShowSentinelModal] = useState(false); 
  const [sentinelReason, setSentinelReason] = useState(""); 


  // --- Hooks ---
  const {
    speak, stop, isPlaying, startListening, stopListening, isListening,
    transcript, isSupported,
  } = useSageVoice();

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const sageName = userData?.sage?.name || "Sage";

  // --- Helpers ---
  const showToast = (msg, type = "success") => {
    // Placeholder toast implementation
    const colors = {
      success: "bg-emerald-500",
      error: "bg-red-500",
      info: "bg-blue-500",
    };
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 ${colors[type]} text-white px-4 py-2 rounded-lg shadow-lg z-50`;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  };
  
  // 🚨 NEW SENTINEL ACTION: Crisis Signal Pipeline Entry Point
  const handleCrisisSignal = useCallback((reason) => {
      setIsPausedBySentinel(true);
      setSentinelReason(reason);
      setShowSentinelModal(true); // Open the alert modal
      
      // ⚡️ CRITICAL: Log the crisis event via the Sentinel Agent for immutable record
      triggerCrisisEscalation(reason);

      // Log the crisis event to conversation
      setConversations((prev) => [...prev, {
        type: "system_alert",
        content: `🚨 **Sentinel Agent Activated:** Dialogue paused due to detected pattern: **${reason}**. Please review the alert.`,
        timestamp: new Date(),
      }]);
  }, []);

  // 🧠 SENTINEL LOGIC: Check context for crisis/distress patterns (REFRACTORED)
  const checkSentinelRules = useCallback((tone, frictionCount, userMessage) => {
      
      // Rule 0: Hard-Coded Governance Violation Check (Uses SentinelAgent function)
      const violation = enforceGovernancePolicies(userMessage);
      if (violation) {
          handleCrisisSignal(violation.reason);
          return true;
      }
      
      // Rule 1: High-Priority Crisis Signal (from EIC - should be Crisis tone)
      // We keep this to catch non-text-based signals (e.g., from voice analysis)
      if (tone === "Crisis") {
          handleCrisisSignal("Critical Distress/Crisis Signal (EIC)");
          return true;
      }
      
      // Rule 2: High Emotional Strain + High Logistical Friction (cognitive overload)
      const highStrain = tone === "Drained" || tone === "Anxious" || tone === "Overwhelmed";
      const highFriction = frictionCount > 1; // More than one friction point logged
      
      if (highStrain && highFriction) {
          handleCrisisSignal("Cognitive Overload/High Strain Pattern");
          return true;
      }

      // If no rule is violated, and we were paused, ensure the agent is not paused
      if (isPausedBySentinel) { 
          // We rely on the unpauseAgent action to clear the pause state.
      }
      return false;
  }, [isPausedBySentinel, handleCrisisSignal]);

  // --- Effects ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, isTyping, currentView]); 

  // 🧠 EFFECT: Monitor Local Context for Sentinel Triggers
  useEffect(() => {
    const tone = localContext.currentEmotionalTone;
    const frictionCount = localContext.logisticalFriction?.length || 0;
    // Passive check on ambient context when not mid-dialogue
    if (!isTyping) {
        // Pass empty string as message, so only tone/friction rules are checked passively
        checkSentinelRules(tone, frictionCount, ""); 
    }
  }, [localContext, isTyping, checkSentinelRules]);

  // --- Core Actions ---

  const clearConversation = () => {
    // Simple state saving for a mock undo
    setUndoState({
        type: "clear",
        data: { prevConversations: conversations, prevOptions: options, prevInsights: insights }
    });
    setConversations([]);
    setOptions(sampleOptions); // Reset options
    setInsights(sampleInsights); // Reset insights
    setShowClearModal(false);
    showToast("Conversation cleared.", "info");
    setLastAction({ type: 'clear', data: {} });
    // Reset Sentinel state on clear
    setIsPausedBySentinel(false);
    setShowSentinelModal(false);
    setSentinelReason("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
  };
  
  // 🟢 UPDATED: This is now an async function
  const handleSendMessage = async (msgText = message) => { 
    if (!msgText.trim()) return;

    // 🛑 INITIAL SENTINEL CHECK: Block new messages if paused
    if (isPausedBySentinel) {
        showToast("Agent Paused: Please use the Sentinel Alert to override or seek help.", "error");
        setShowSentinelModal(true); // Re-open the modal
        return;
    }
    
    // Convert message to lowercase for trigger check
    const normalizedMsg = msgText.trim().toLowerCase();

    // 1. Add user message to conversation log immediately
    const userMsg = {
        type: "user",
        content: msgText.trim(),
        timestamp: new Date(),
    };

    setConversations((prev) => {
        setLastAction({ type: 'message_sent', data: { prevConversations: prev } });
        return [...prev, userMsg];
    });

    setMessage("");
    setIsTyping(true);
    
    
    // 2. 🧠 CONTEXT QUERY INTERCEPT
    const isContextQuery = contextQueryTriggers.some(trigger => normalizedMsg.includes(trigger));
    
    if (isContextQuery) {
        // Handle the context query immediately
        // Note: The LLM call is skipped for this local, mocked response.
        const summary = generateContextSummary(localContext);
        const sageMsg = { 
            type: "sage", 
            content: summary, 
            timestamp: new Date(),
            isContextResponse: true, // Special flag for potential future styling
        };
        setConversations((prev) => [...prev, sageMsg]);
        setIsTyping(false);
        if (voiceEnabled) stop(sageMsg.content); 
        return; // STOP execution of the normal messaging loop
    }
    
    // ------------------------------------
    // --- CONTINUE with NORMAL LOGIC ---
    // ------------------------------------

    // 3. CONTEXT ENRICHMENT (WRITE)
    const userTopic = extractTopicTag(msgText.trim());
    
    // ✅ CRITICAL CHANGE: Call the imported EIC function
    const { tone: userEmotion, energy: userEnergy } = analyzeUserTone(msgText.trim());

    // Update the Ambient Context
    let currentFrictionLength;
    updateLocalContext('currentEmotionalTone', userEmotion);
    updateLocalContext('lastTopic', userTopic);
    
    const newFriction = userEmotion === "Drained" || userEmotion === "Anxious"
      ? [{ content: "Conversation Strain", source: "EIC" }] // Add the entry
      : []; // Don't add

    currentFrictionLength = localContext.logisticalFriction?.length || 0; 
    
    // 🚨 PRIMARY SENTINEL CHECK: Check the message against all rules
    if (checkSentinelRules(userEmotion, currentFrictionLength, msgText.trim())) {
      setMessage(""); // Clear input
      setIsTyping(false); // Stop typing indicator
      return;
    }
    
    // 4. 🟢 LLM SERVICE CALL (Replacing the old setTimeout mock logic)
    try {
        // Prepare context and history
        const conversationHistory = conversations.slice(0, -1); // Current conversations minus the new user message already added
        
        const response = await llmService.sendMessage(msgText.trim(), {
            cfState,                 // 🟢 INJECT COGNITIVE FIELD STATE HERE
            conversationHistory,     // Pass the history
        });

        const sageMsg = { 
            type: "sage", 
            content: response.content, 
            timestamp: new Date(),
            model: response.model,
            usage: response.usage,
            metadata: response.metadata,
        };
        
        setConversations((prev) => [...prev, sageMsg]);
        if (voiceEnabled) speak(response.content);

    } catch (error) {
        console.error("LLM Service Error:", error);
        const errorMsg = {
            type: "system_alert",
            content: error.fallbackMessage || "An error occurred while connecting to the intelligence network. Please try again.",
            timestamp: new Date(),
        };
        setConversations((prev) => [...prev, errorMsg]);
    }
    
    setIsTyping(false); 
  };
  
  // 🧠 SENTINEL UNPAUSE ACTION (Updated to close modal)
  const unpauseAgent = () => {
      setIsPausedBySentinel(false);
      setShowSentinelModal(false); // CRITICAL: Close the modal
      showToast("Sentinel override activated. Agent unpaused.", "info");
      setConversations((prev) => [...prev, {
        type: "system",
        content: "✅ User-initiated override: Conversation unpaused.",
        timestamp: new Date(),
      }]);
  };
  
  // (Omitted helper functions from base file for brevity)
  const saveAsBranch = (name) => {
    const newBranch = {
        id: Date.now(),
        name: name || `Branch ${branches.length + 1}`,
        conversations: conversations,
        options: options,
        insights: insights,
        timestamp: new Date().toLocaleDateString(),
        summary: `Dialogue: ${conversations.length}, Options: ${options.length}`,
    };
    setBranches((prev) => [...prev, newBranch]);
    setShowSaveBranchModal(false);
    showToast(`Branch "${newBranch.name}" saved!`);
  };

  const loadBranch = (id) => {
    const branch = branches.find(b => b.id === id);
    if (branch) {
        setConversations(branch.conversations);
        setOptions(branch.options);
        setInsights(branch.insights);
        setShowBranchModal(false);
        showToast(`Branch "${branch.name}" loaded successfully.`);
    }
  };

  const deleteBranch = (id) => {
    setBranches(prev => prev.filter(b => b.id !== id));
    showToast("Branch deleted.");
  };
  
  const handleUndo = () => {
    if (lastAction) {
        if (lastAction.type === 'message_sent' && lastAction.data) {
            setConversations(lastAction.data.prevConversations);
            setLastAction(null);
            showToast("Action undone.", "info");
        } else if (lastAction.type === 'clear' && undoState.type === 'clear') {
            setConversations(undoState.data.prevConversations);
            setOptions(undoState.data.prevOptions);
            setInsights(undoState.data.prevInsights);
            setLastAction(null);
            showToast("Clear undone.", "info");
        } else {
            showToast("Nothing to undo.", "error");
        }
    } else {
        showToast("Nothing to undo.", "error");
    }
  };

  const exportConversation = (format) => {
    const data = format === 'json' ? JSON.stringify(conversations, null, 2) : conversations.map(c => `[${c.type.toUpperCase()}] ${c.content}`).join('\n\n');
    console.log(`Exported data in ${format} format.`);
    showToast(`Conversation exported as ${format}.`, "success");
  };

  const importConversation = (event) => {
    showToast("Importing conversation... (Placeholder)", "info");
  };
  
  const startNewJourney = () => {
    clearConversation();
    showToast("New journey started.", "success");
  };

  const handleExploreOption = (id) => showToast(`Exploring option ${id}... (Placeholder)`, "info");
  
  const handleArchiveOption = (id) => {
    setOptions(prev => prev.filter(opt => opt.id !== id));
    showToast("Option archived.", "info");
  };

  const handleToggleExpanded = (id) => {
    setExpandedOptions(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        return newSet;
    });
  };

  const handleValuesCheck = () => showToast("Values Check panel opened (placeholder)", "info");
  const handleTimelineView = () => showToast("Timeline View opened (placeholder)", "info");
  const handleLiveSearch = () => showToast("Live Search opened (placeholder)", "info");
  const handleDecisionMap = () => setCurrentView("decisionMap");
  const handleReturnToDashboard = () => setCurrentView("dashboard");
  const onOpenContextOverlay = () => showToast("Opening Ambient Awareness Context Overlay (placeholder)", "info");
  const handlePinOption = (id) => {
    setOptions(prevOptions => prevOptions.map(opt => 
      opt.id === id ? { ...opt, pinned: !opt.pinned } : opt
    ));
    showToast("Option pin toggled");
  };
  
  // --- Return structured API ---
  return {
    state: {
      conversations,
      message,
      isTyping,
      options,
      insights,
      expandedOptions,
      activeTab,
      voiceEnabled,
      showClearModal,
      showBranchModal,
      showSaveBranchModal,
      branches,
      lastAction,
      showComparePanel,
      currentView,
      // Sentinel Exports
      isPausedBySentinel, 
      showSentinelModal, 
      sentinelReason,    
      isPlaying,
      isListening,
      isSupported,
    },
    actions: {
      handleSendMessage,
      setMessage,
      handleKeyPress,
      startListening,
      stopListening,
      stopSpeaking: stop,
      setVoiceEnabled,
      setShowClearModal,
      clearConversation, 
      setShowSaveBranchModal,
      saveAsBranch,
      setShowBranchModal,
      loadBranch,
      deleteBranch,
      handleUndo,
      handlePinOption,
      handleExploreOption,
      handleArchiveOption,
      handleToggleExpanded,
      setActiveTab,
      exportConversation,
      importConversation,
      handleValuesCheck,
      handleTimelineView,
      handleDecisionMap,
      handleReturnToDashboard,
      handleLiveSearch,
      startNewJourney,
      setShowComparePanel,
      // Sentinel Actions
      unpauseAgent,
      setShowSentinelModal, 
      onOpenContextOverlay,
    },
    data: { promptTemplates, chatEndRef, inputRef, sageName },
  };
};

export default useSageOrchestrator;
