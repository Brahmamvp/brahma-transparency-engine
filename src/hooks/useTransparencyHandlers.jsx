// src/hooks/useTransparencyHandlers.jsx
import { useCallback } from "react";
import { saveConversationToHistory } from "../components/transparency/HistoryPanel.jsx";
import { useLLMClient } from "./useLLMClient.jsx"; // FIX: Named import for hook (not default LLMService class)
import governanceAgent from "../agents/GovernanceAgent.js"; // <-- NEW
import { exportAuditTrail, exportManifest } from "../utils/manifest.js"; // <-- NEW

const useTransparencyHandlers = ({
  conversations,
  setConversations,
  setIsTyping,
  activeModel,
  setSelectedOption,
  setPinnedOptions,
  setOptions,
  setHasLifetimePrivacy,
  setShowPrivacyContract,
  setSettings,
  setCurrentView,
  setIsModuleLoading,
  setSimScenario,
  setShowSim,
  mode,
  sageName,
  state,
  acfContext,
}) => {
  // FIX: Invokes hook correctly (returns { callLLM, isLLMReady, ... }); null safety for acfContext
  const { callLLM, isLLMReady, loading: isGenerating } = useLLMClient(acfContext || {});

  /** ========== CORE LLM HANDLER ========== */
  const handleSendLLM = async (userMessage) => {
    setConversations((prev) => [
      ...prev,
      { role: "user", content: userMessage, user: userMessage, model: activeModel },
    ]);
    setIsTyping(true);

    if (!isLLMReady) {
      setIsTyping(false);
      setConversations((prev) => [
        ...prev,
        {
          role: "sage",
          content: "Please set your API key in Settings to enable Sage’s intelligence.",
          sage: "Please set your API key in Settings to enable Sage’s intelligence.",
          model: activeModel,
        },
      ]);
      return;
    }

    try {
      const system = "You are Sage, a reflective AI companion on the Brahma platform. Respond naturally and contextually.";
      const result = await callLLM(
        { system, user: userMessage },
        { model: activeModel, conversationHistory: conversations }
      );

      const responseText = typeof result === "string"
        ? result
        : result?.text || JSON.stringify(result);

      setConversations((prev) => [
        ...prev,
        {
          role: "sage",
          content: responseText,
          sage: responseText,
          model: result.model || activeModel,
          tone: result.tone || "neutral",
          adviceId: `advice-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // <-- NEW: Trackable ID
        },
      ]);
    } catch (error) {
      console.error("Sage LLM Error:", error);
      const fallback = "I encountered an issue connecting to the language model. Please verify your API key or try again soon.";
      setConversations((prev) => [
        ...prev,
        { role: "sage", content: fallback, sage: fallback, model: activeModel },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  /** ========== CHAT HANDLER (FROM SAGECHAT) ========== */
  const handleSendMessage = useCallback(
    (userMessage, agent, mode, model, aiResponse) => {
      const normalizedResponse = typeof aiResponse === "string"
        ? aiResponse
        : aiResponse?.text || JSON.stringify(aiResponse || {});

      setConversations((prev) => [
        ...prev,
        { role: "user", content: userMessage, user: userMessage, timestamp: new Date().toISOString() },
        normalizedResponse && {
          role: "sage",
          content: normalizedResponse,
          sage: normalizedResponse,
          timestamp: new Date().toISOString(),
          agent,
          mode,
          model,
          adviceId: `advice-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // <-- NEW
        },
      ].filter(Boolean));
    },
    [setConversations]
  );

  /** ========== DELETE ADVICE (NEW) ========== */
  const handleDeleteAdvice = useCallback((adviceId) => {
    if (!window.confirm("Permanently delete this advice? It will be redacted from memory and audit-logged.")) {
      return;
    }

    governanceAgent.deleteAdvice(adviceId, conversations, setConversations);
  }, [conversations, setConversations]);

  /** ========== EXPORT AUDIT & MANIFEST (NEW) ========== */
  const handleExportAudit = useCallback(() => {
    exportAuditTrail();
  }, []);

  const handleExportManifest = useCallback(() => {
    exportManifest();
  }, []);

  /** ========== OTHER HANDLERS (UNCHANGED) ========== */
  const handleExploreOption = (o) => {
    setSelectedOption(o);
    handleSendLLM(`I want to explore "${o.title}" more deeply.`);
  };

  const handlePinOption = (id) =>
    setPinnedOptions((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const handleArchiveOption = (id) =>
    setOptions((p) => p.filter((o) => o.id !== id));

  const handleActivatePrivacy = () => {
    setHasLifetimePrivacy(true);
    setShowPrivacyContract(false);
  };

  const handleSettingsChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setTimeout(() => window.dispatchEvent(new Event("resize")), 100);
  };

  const handleSaveHistory = () => {
    saveConversationToHistory(conversations, mode, sageName, activeModel);
  };

  const openSimulation = (scenarioText) => {
    setSimScenario(scenarioText);
    setShowSim(true);
    setCurrentView("simulation");
  };

  const handleNavigate = (view) => {
    setIsModuleLoading(true);
    setTimeout(() => {
      setCurrentView(view);
      setIsModuleLoading(false);
    }, 500);
  };

  const handleValuesCheck = useCallback(() => {
    state?.setShowValuesCheck?.(true);
  }, [state]);

  const handleTimelineView = useCallback(() => {
    state?.setShowTimelineView?.(true);
  }, [state]);

  const handleDecisionMap = useCallback(() => {
    setCurrentView?.("decisionMap");
  }, [setCurrentView]);

  const handleLiveSearch = useCallback(() => {
    setCurrentView?.("search");
  }, [setCurrentView]);

  const handleOpenContextOverlay = useCallback(() => {
    state?.setShowContextPanel?.((prev) => !prev);
  }, [state]);

  /** ========== RETURN ========== */
  return {
    handleSendLLM,
    handleSendMessage,
    handleExploreOption,
    handlePinOption,
    handleArchiveOption,
    handleActivatePrivacy,
    handleSettingsChange,
    handleSaveHistory,
    openSimulation,
    handleNavigate,
    handleValuesCheck,
    handleTimelineView,
    handleDecisionMap,
    handleLiveSearch,
    handleOpenContextOverlay,
    handleDeleteAdvice,        // ← NEW
    handleExportAudit,         // ← NEW
    handleExportManifest,      // ← NEW
  };
};

export default useTransparencyHandlers;
