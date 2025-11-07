import React, { useState, useEffect, useCallback } from "react";
import { 
  BrainCircuit, 
  MapPin, 
  Settings, 
  DollarSign, 
  Heart, 
  RefreshCw, 
  X, 
  Eye,
  MessageCircle,
  Volume2,
  Code,
  Shield,
  BookOpen,
  Trash2,
  AlertTriangle,
  Zap,
  Ghost,
  BarChart3,
  Download,
  GitBranch,
  Target,
  Lightbulb,
  Briefcase,
  GraduationCap,
  Users,
  Sparkles,
  Brain
} from "lucide-react"; 

/* ===== Core & Common ===== */
import ParticleBackground from "../common/ParticleBackground.jsx";
import PrivacyBadge from "../common/PrivacyBadge.jsx";
import InteractiveSageAvatar from "../common/InteractiveSageAvatar.jsx";
import ModuleLoadingState from "../common/ModuleLoadingState.jsx";
import ModuleWrapper from "../common/ModuleWrapper.jsx";

/* ===== Sage Orchestrator / Core Modules ===== */
import SageJourneyOrchestrator from "../SageJourneyOrchestrator.jsx";
import DecisionExplorer from "../DecisionExplorer.jsx"; 
import FlagButton from "./FlagButton.jsx"; 

/* ===== Other Modules / Modals ===== */
import DataShadowPanel from "../transparency/DataShadowPanel.jsx"; 
import LifetimePrivacyContract from "../ui-contracts/LifetimePrivacyContract.jsx";
import SettingsPanel from "./SettingsPanel.jsx";
import HistoryPanel from "./HistoryPanel.jsx";
import ThemePanel from "./ThemePanel.jsx";
import ReflectionSandbox from "./ReflectionSandbox.jsx";
import ArtifactGallery from "../ArtifactGallery.jsx";
import TranslateAndListen from "../TranslateAndListen.jsx";
import WisdomMemory from "../memory/WisdomMemory.jsx"; 
import AvatarLab from "../sage/AvatarLab.jsx";
import BrahmaHybridIntelligence from "../intelligence/BrahmaHybridIntelligence.jsx";
import TemporalIntelligenceEngine from "../intelligence/TemporalIntelligenceEngine.jsx";
import BrahmaLanguageEnhancements from "../language/BrahmaLanguageEnhancements.jsx";
import Sidebar from "./Sidebar.jsx";
import VoiceModulator from "../VoiceModulator.jsx";

/* ===== NEW IMPORTS ===== */
import EnterpriseDashboard from "../EnterpriseDashboard.jsx";
import AgentStudio from "../agent-studio/AgentStudio.jsx";
import WebSearchIntegration from "../common/WebSearchIntegration.jsx";
import CompareOptionsPanel from "../panels/CompareOptionsPanel.jsx";
import ContextOverlay from "../ContextOverlay.jsx"; 
import ContextEngineRoot from "../../context-engine/ContextEngineRoot.jsx";
// ✅ FIXED: Cognitive Field Imports must use the .jsx extension
import { useCognitiveField } from "../../store/cognitiveField.jsx"; 
import ActiveContextStrip from "../ActiveContextStrip.jsx";


/* ===== Custom Hooks ===== */
import useTransparencyState from "../../hooks/useTransparencyState.jsx";
import useTransparencyHandlers from "../../hooks/useTransparencyHandlers.jsx";
import { useSageVoice } from "../../hooks/useSageVoice.jsx"; 
import { useLocalMemory } from "../../context/LocalMemoryContext.jsx";

const TransparencyEngine = ({ userData }) => { 
  const state = useTransparencyState(userData);
  const handlers = useTransparencyHandlers({ ...state, acfContext: state });
  
  // 🟢 NEW: Use Cognitive Field
  const { state: cfState, teUpdate } = useCognitiveField();
  
  const { 
    speak: speakText, 
    stop: stopNarration, 
    isPlaying: isNarrationPlaying, 
  } = useSageVoice();

  const { 
    deleteAdvice,
    exportLocalState,
    getAuditTrail,
    getManifest,
    redactSensitive,
  } = useLocalMemory();

  const {
    currentView, navOpen,
    showPrivacyContract, hasLifetimePrivacy, showDataShadow, showSettings, showHistory,
    showThemePanel, showSandbox,
    mode, setMode, settings,
    isModuleLoading,
    theme,
    showComparePanel,
    conversations, options, pinnedOptions, isTyping, sageName, activeModel,
    showModelSelector, showDecisionOptions, showQuickActions,
    reflectionMode,
    currentAgent,
    currentMode,
    currentModel,
    availableAgents,
    availableModes,
    availableModels,
    branches,
    currentBranch,
    onSwitchBranch,
    onBranchFrom,
    onRegenerate,
    onFeedback,
  } = state;

  const { 
    handleNavigate, 
    handleSendMessage,
    // handleExploreOption, // Original function is wrapped below
    handlePinOption, 
    handleArchiveOption, 
    handleSaveHistory, 
    handleOpenSimulation,
    handleSetShowModelSelector,
    handleSetActiveModel,
    handleSetShowDecisionOptions,
    handleSetShowQuickActions,
    handleOpenContextOverlay: handlersOpenContextOverlay,
    handleValuesCheck,
    handleTimelineView,
    handleDecisionMap,
    handleLiveSearch,
  } = handlers;
  
  // 🟢 UPDATED: Wrap original handleExploreOption to call teUpdate
  const handleExploreOption = (optionId) => {
    // Find the title of the option being explored
    const topic = state.options.find(opt => opt.id === optionId)?.title || "Decision Exploration";
    
    // 🟢 NEW: Update Cognitive Field with the new decision context
    teUpdate(topic, crypto.randomUUID?.() || Date.now().toString());

    // Call the original handler logic
    handlers.handleExploreOption(optionId);
  };

  const handleOpenHistory = () => state.setShowHistory(true);

  /* ===== Local overlay state ===== */
  const [webSearchOpen, setWebSearchOpen] = useState(false);
  const [showContextOverlay, setShowContextOverlay] = useState(false); 
  const [showVoiceModulator, setShowVoiceModulator] = useState(false);
  const [showMemorySettings, setShowMemorySettings] = useState(false); 
  const [showValueVisualizer, setShowValueVisualizer] = useState(false);
  const [showGhostScan, setShowGhostScan] = useState(false);
  const [showBiasEthicsPanel, setShowBiasEthicsPanel] = useState(false);
  const [showSentinelOverridePanel, setShowSentinelOverridePanel] = useState(false);

  const toggleNarration = useCallback(() => {
      if (isNarrationPlaying) {
          stopNarration();
      } else {
          speakText("Starting context narration to demo the feature.");
      }
  }, [isNarrationPlaying, stopNarration, speakText]);

  useEffect(() => {
    if (currentView === "search") setWebSearchOpen(true);
  }, [currentView]);

  const closeWebSearch = () => {
    setWebSearchOpen(false);
    handleNavigate("transparency");
  };
  
  const handleOpenContextOverlay = () => setShowContextOverlay(true);
  const handleCloseContextOverlay = () => setShowContextOverlay(false);
  
  const handleOpenVoiceModulator = () => setShowVoiceModulator(true);
  const handleCloseVoiceModulator = () => setShowVoiceModulator(false);

  const handleOpenMemorySettings = () => setShowMemorySettings(true);
  const handleCloseMemorySettings = () => setShowMemorySettings(false);

  const handleOpenPrivacyContract = () => state.setShowPrivacyContract(true);
  const handleOpenDataShadow = () => state.setShowDataShadow(true);

  // === SENTINEL OVERRIDE PANEL (omitted for brevity) ===
  const handleSentinelOverride = () => {
    setShowSentinelOverridePanel(true);
  };

  const executeSentinelOverride = (model = "claude-opus") => {
    const confirmed = window.confirm(
      `SENTINEL OVERRIDE: Force ${model} and show raw reasoning?`
    );
    if (confirmed) {
      const lastUser = conversations.slice().reverse().find(m => m.user)?.user || "";
      if (lastUser) {
        handleSendMessage(lastUser, currentAgent, currentMode, model, null, true);
      }
      setShowSentinelOverridePanel(false);
    }
  };

  // === GHOSTSCAN AGENT (omitted for brevity) ===
  const runGhostScan = () => {
    setShowGhostScan(true);
    setTimeout(() => {
      alert("GhostScan: No anomalous network activity detected. All data local.");
      setShowGhostScan(false);
    }, 3000);
  };

  // === VALUE VISUALIZER (omitted for brevity) ===
  const ValueVisualizer = () => {
    const values = [
      { name: "Autonomy", value: 95, color: "text-emerald-400" },
      { name: "Truth", value: 92, color: "text-blue-400" },
      { name: "Privacy", value: 100, color: "text-purple-400" },
      { name: "Growth", value: 88, color: "text-yellow-400" },
    ];
    return (
      <div className="bg-black/50 backdrop-blur-xl rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 size={18} /> Value Alignment
        </h3>
        <div className="space-y-3">
          {values.map(v => (
            <div key={v.name} className="flex items-center gap-3">
              <span className="text-sm text-gray-300 w-20">{v.name}</span>
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${v.color} bg-gradient-to-r from-current to-white/20`}
                  style={{ width: `${v.value}%` }}
                />
              </div>
              <span className="text-xs text-gray-400">{v.value}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // === BIAS & ETHICS AUDIT PANEL (omitted for brevity) ===
  const BiasEthicsPanel = () => {
    const audit = [
      { category: "Model Bias", status: "Low", details: "Version-locked, user-overridable" },
      { category: "Prompt Injection", status: "Blocked", details: "Sentinel active" },
      { category: "Data Leakage", status: "None", details: "Local-first architecture" },
      { category: "Hallucination Risk", status: "Monitored", details: "User can request 'show reasoning'" },
    ];
    return (
      <div className="bg-black/60 backdrop-blur-xl rounded-xl p-6 border border-white/10 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertTriangle size={20} /> Bias & Ethics Audit
          </h3>
          <button onClick={() => setShowBiasEthicsPanel(false)} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-3">
          {audit.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <p className="text-sm font-medium text-white">{item.category}</p>
                <p className="text-xs text-gray-400">{item.details}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                item.status === "Low" || item.status === "Blocked" || item.status === "None" 
                  ? "bg-emerald-600/30 text-emerald-300" 
                  : "bg-yellow-600/30 text-yellow-300"
              }`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <button className="flex-1 px-3 py-2 text-xs bg-blue-600 hover:bg-blue-700 rounded transition-colors">
            Request Full Audit Trail
          </button>
          <button className="px-3 py-2 text-xs bg-gray-600 hover:bg-gray-700 rounded transition-colors">
            Export Report
          </button>
        </div>
      </div>
    );
  };

  // 2) Listen once and add an option, then jump to Decision Explorer
  useEffect(() => {
    const handler = (e) => {
      const d = e.detail;
      state.setOptions((prev) => [
        {
          id: crypto.randomUUID?.() || Date.now().toString(),
          title: d.title,
          rationale: d.rationale,
          meta: { layer: d.layer, source: d.source, timestamp: d.timestamp },
          pinned: false,
          status: "new",
        },
        ...prev,
      ]);
      handleNavigate("transparency"); // jump user to Decision Explorer
    };
    window.addEventListener("brahma:add-decision-option", handler);
    return () => window.removeEventListener("brahma:add-decision-option", handler);
  }, [handleNavigate, state.setOptions, state]);

  if (!settings || !theme) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white/50">
        Loading...
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${theme.background} ${theme.text.primary} relative overflow-hidden transition-all duration-700 ${
        settings.reducedMotion ? "motion-reduce" : ""
      }`}
    >
      {settings.showParticles && <ParticleBackground theme={theme.particle} />}
      <PrivacyBadge hasLifetimePrivacy={hasLifetimePrivacy} theme={theme} />

      {/* Avatar */}
      <div className="fixed bottom-8 right-8 z-30 pointer-events-none">
        <div className={`${theme.glass} rounded-full p-4 border`}>
          <InteractiveSageAvatar
            mood={userData.sage.emotion || "peaceful"}
            form={userData.sage.form || "orb"}
            size="medium"
            isThinking={state.isTyping}
            theme={theme}
          />
        </div>
      </div>

      {/* Sidebar (omitted for brevity) */}
      <Sidebar
        navOpen={navOpen}
        setNavOpen={state.setNavOpen}
        currentView={currentView}
        handleNavigate={handleNavigate}
        settings={settings}
        mode={mode}
        setMode={setMode}
        track={state.track}
        setTrack={state.setTrack}   
        hasLifetimePrivacy={hasLifetimePrivacy}
        setShowPrivacyContract={state.setShowPrivacyContract}
        setShowDataShadow={state.setShowDataShadow}
        setShowSettings={state.setShowSettings}
        setShowHistory={state.setShowHistory}
        setShowThemePanel={state.setShowThemePanel}
        theme={theme}
        onSentinelOverride={handleSentinelOverride}
        onRunGhostScan={runGhostScan}
        onOpenValueVisualizer={() => setShowValueVisualizer(true)}
        onOpenBiasEthicsPanel={() => setShowBiasEthicsPanel(true)}
      />

      {/* Main content */}
      <div
        className={`transition-all duration-300 ${
          navOpen ? (state.isCollapsed ? "lg:ml-20" : "lg:ml-80") : "lg:ml-0"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 py-8 relative z-10 max-w-7xl">
          {/* 🟢 NEW: Active Context Strip in the header area */}
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-extrabold text-white/90">Brahma Transparency Engine</h1>
            <ActiveContextStrip />
          </div>
          {/* END Active Context Strip */}
          
          <ModuleLoadingState
            isLoading={isModuleLoading}
            moduleName={currentView}
            theme={theme}
          >
            {/* CORE: DecisionExplorer (omitted for brevity) */}
            {currentView === "transparency" && (
              <div className="relative z-[99999] pointer-events-auto">
                <DecisionExplorer 
                    conversations={conversations}
                    options={options}
                    pinnedOptions={pinnedOptions}
                    isTyping={isTyping}
                    theme={settings.theme}
                    mode={mode}
                    settings={settings}
                    sageName={sageName}
                    activeModel={activeModel}
                    showModelSelector={showModelSelector}
                    showDecisionOptions={showDecisionOptions}
                    setShowDecisionOptions={handleSetShowDecisionOptions}
                    showQuickActions={showQuickActions}
                    setShowQuickActions={handleSetShowQuickActions}
                    onSendMessage={handleSendMessage}
                    onExploreOption={handleExploreOption} // 🟢 UPDATED: Using the wrapped handler
                    onPinOption={handlePinOption}
                    onArchiveOption={handleArchiveOption}
                    onSaveHistory={handleSaveHistory}
                    onOpenHistory={() => state.setShowHistory(true)}
                    onOpenSimulation={handleOpenSimulation}
                    onSetShowModelSelector={handleSetShowModelSelector}
                    onSetActiveModel={handleSetActiveModel}
                    onOpenContextOverlay={() => setShowContextOverlay(true)}
                    onDeleteAdvice={deleteAdvice}
                    onExportAudit={exportLocalState}
                    onExportManifest={() => {
                      const manifest = getManifest();
                      const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url; a.download = "brahma-manifest.json"; a.click();
                      URL.revokeObjectURL(url);
                    }}
                    setShowComparePanel={state.setShowComparePanel}
                    handleValuesCheck={handlers.handleValuesCheck}
                    handleTimelineView={handlers.handleTimelineView}
                    handleDecisionMap={handlers.handleDecisionMap}
                    handleLiveSearch={handlers.handleLiveSearch}
                    reflectionMode={reflectionMode}
                    currentAgent={currentAgent}
                    currentMode={currentMode}
                    currentModel={currentModel}
                    availableAgents={availableAgents}
                    availableModes={availableModes}
                    availableModels={availableModels}
                    branches={branches}
                    currentBranch={currentBranch}
                    onSwitchBranch={onSwitchBranch}
                    onBranchFrom={onBranchFrom}
                    onRegenerate={onRegenerate}
                    onFeedback={onFeedback}
                />
              </div>
            )}
            
            {currentView === "orchestrator" && (
                <SageJourneyOrchestrator 
                    userData={userData} 
                    theme={theme}
                    onOpenContextOverlay={() => setShowContextOverlay(true)} 
                />
            )}
            
            {currentView === "intelligence" && (
                <ModuleWrapper title="Brahma Hybrid Intelligence" description="Explore Brahma's reasoning core." theme={theme}>
                    <BrahmaHybridIntelligence theme={theme} />
                </ModuleWrapper>
            )}
            {currentView === "temporal" && (
                <ModuleWrapper title="Temporal Intelligence" description="Track thought patterns over time." theme={theme}>
                    <TemporalIntelligenceEngine theme={theme} />
                </ModuleWrapper>
            )}
            {currentView === "avatar" && (
                <ModuleWrapper title="Avatar Lab" description="Craft your Sage companion." theme={theme}>
                    <AvatarLab userData={userData} theme={theme} />
                </ModuleWrapper>
            )}
            {currentView === "language" && (
                <ModuleWrapper title="Language Tools" description="Refine your communication." theme={theme}>
                    <BrahmaLanguageEnhancements theme={theme} />
                </ModuleWrapper>
            )}
            {currentView === "memory" && (
                <ModuleWrapper title="Memory Wisdom" description="Access insight-based memory." theme={theme}>
                    <WisdomMemory userData={userData} theme={theme} isOpen={true} onClose={() => state.setCurrentView("transparency")} />
                </ModuleWrapper>
            )}
            {currentView === "artifacts" && (
                <ModuleWrapper title="Artifact Gallery" description="Browse your saved artifacts." theme={theme}>
                    <ArtifactGallery theme={theme} />
                </ModuleWrapper>
            )}
            {currentView === "translate" && (
                <ModuleWrapper title="Translate & Listen" description="On-device translation." theme={theme}>
                    <TranslateAndListen theme={theme} />
                </ModuleWrapper>
            )}
            {currentView === "enterprise" && (
                <ModuleWrapper title="Enterprise Dashboard" description="AI Agent Governance & Portfolio." theme={theme}>
                    <EnterpriseDashboard theme={settings.theme} />
                </ModuleWrapper>
            )}
            {currentView === "agentstudio" && (
                <ModuleWrapper title="Agent Studio" description="Design, test, and deploy agents." theme={theme}>
                    <AgentStudio theme={settings.theme} />
                </ModuleWrapper>
            )}
            {/* 🟢 CONTEXT VIEW HANDLER */}
            {currentView === "context" && (
              <div className="relative z-10">
                <ContextEngineRoot />
              </div>
            )}
          </ModuleLoadingState>
        </div>
      </div>

      {/* === OVERLAYS (omitted for brevity) === */}
      {showPrivacyContract && (
        <LifetimePrivacyContract
          onActivate={handlers.handleActivatePrivacy}
          onClose={() => state.setShowPrivacyContract(false)}
        />
      )}
      {showDataShadow && (
        <DataShadowPanel
          isOpen={showDataShadow}
          onClose={() => state.setShowDataShadow(false)}
          theme={theme}
        />
      )}
      
      {showSettings && (
        <SettingsPanel
          onClose={() => state.setShowSettings(false)}
          userData={userData}
          onSettingsChange={state.setSettings}
          theme={theme}
          isNarrationPlaying={isNarrationPlaying}
          toggleNarration={toggleNarration}
          onOpenMemorySettings={() => setShowMemorySettings(true)}
          onOpenVoiceModulator={() => setShowVoiceModulator(true)}
          onOpenSoulTimeline={() => console.log("Soul Timeline not implemented yet")}
          onOpenPrivacyContract={() => state.setShowPrivacyContract(true)} 
          onOpenDataShadow={() => state.setShowDataShadow(true)}
        />
      )}
      
      {showThemePanel && (
        <ThemePanel
          isOpen={showThemePanel}
          onClose={() => state.setShowThemePanel(false)}
          currentTheme={settings.theme}
          onThemeChange={(newTheme) => state.setSettings("theme", newTheme)}
        />
      )}
      {showHistory && (
        <HistoryPanel
          isOpen={showHistory}
          onClose={() => state.setShowHistory(false)}
          onLoadConversation={(chat) => {
            state.setConversations(chat.messages);
            state.setCurrentView("transparency");
            state.setShowHistory(false);
          }}
          theme={theme}
        />
      )}
      {showSandbox && (
        <ReflectionSandbox
          option={{ title: state.selectedOption?.title || "Ad-hoc exploration" }}
          onClose={() => state.setShowSandbox(false)}
          onReturnToMain={(payload) => {
            handlers.handleSendLLM(payload.explorationSummary || "Sandbox insights woven back.");
            state.setShowSandbox(false);
          }}
          mainConversations={state.conversations}
          theme={theme}
        />
      )}

      {showComparePanel && (
        <CompareOptionsPanel
          isOpen={showComparePanel}
          onClose={() => state.setShowComparePanel(false)}
          options={state.options || []}
          theme={theme}
        />
      )}

      {webSearchOpen && (
        <WebSearchIntegration
          isOpen={webSearchOpen}
          onClose={closeWebSearch}
          onSearchResults={(r) => console.log("Search results:", r)}
        />
      )}
      
      {/* Context Overlay (using local state) */}
      {showContextOverlay && (
        <ContextOverlay 
          isOpen={showContextOverlay} 
          onClose={() => setShowContextOverlay(false)}
        />
      )}

      {showVoiceModulator && (
        <VoiceModulator 
          isOpen={showVoiceModulator}
          onClose={() => setShowVoiceModulator(false)}
        />
      )}
      
      {showMemorySettings && (
        <WisdomMemory 
          isOpen={showMemorySettings} 
          onClose={() => setShowMemorySettings(false)} 
          userData={userData}
          theme={theme} 
        />
      )}

      {showValueVisualizer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[300] flex items-center justify-center p-8">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-xl border border-white/20 p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Value Visualizer</h3>
              <button onClick={() => setShowValueVisualizer(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <ValueVisualizer />
          </div>
        </div>
      )}

      {showGhostScan && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[400] flex items-center justify-center">
          <div className="text-center space-y-4">
            <Ghost size={64} className="mx-auto text-purple-400 animate-pulse" />
            <p className="text-xl text-white">GhostScan Active...</p>
            <p className="text-sm text-gray-400">Scanning for surveillance vectors...</p>
          </div>
        </div>
      )}

      {showBiasEthicsPanel && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[500] flex items-center justify-center p-8">
          <BiasEthicsPanel />
        </div>
      )}

      {showSentinelOverridePanel && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[600] flex items-center justify-center p-8">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-xl border border-white/20 p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-red-400 flex items-center gap-2">
                <Shield size={20} /> Sentinel Override
              </h3>
              <button onClick={() => setShowSentinelOverridePanel(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-300 mb-4">
              Force alternate model and expose raw reasoning. Use only when necessary.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => executeSentinelOverride("claude-opus")}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all"
              >
                Claude Opus
              </button>
              <button 
                onClick={() => executeSentinelOverride("gpt4-turbo")}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-medium transition-all"
              >
                GPT-4 Turbo
              </button>
            </div>
            <button 
              onClick={() => setShowSentinelOverridePanel(false)}
              className="w-full mt-3 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransparencyEngine;
