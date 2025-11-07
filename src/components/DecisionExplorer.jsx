// src/components/transparency/DecisionExplorer.jsx
import React from 'react';
import { 
  Scale, Target, Clock, Map, Search, Globe, Users, TrendingUp,
  BrainCircuit, Shield, BookOpen, Trash2, Download, AlertTriangle,
  Zap, Ghost, BarChart3, MessageCircle, GitBranch, Lightbulb, Sparkles
} from "lucide-react"; 

/* ===== Core Components ===== */
import SageChat from "./transparency/SageChat.jsx";
import OptionCard from "./transparency/OptionCard.jsx";
import ModelSelector from "./transparency/ModelSelector.jsx";

/* ===== Context & Hooks ===== */
import { useLocalMemory } from "../context/LocalMemoryContext.jsx"; // FIXED PATH

/* ===== Themes ===== */
import { themes } from "../styles/themes.js";

const DecisionExplorer = ({
  conversations,
  options,
  pinnedOptions,
  isTyping,
  theme,
  mode,
  settings,
  sageName,
  activeModel,
  showModelSelector,
  showDecisionOptions,
  setShowDecisionOptions,
  showQuickActions,
  setShowQuickActions,
  onSendMessage,
  onExploreOption,
  onPinOption,
  onArchiveOption,
  onSaveHistory,
  onOpenHistory,
  onOpenSimulation,
  onSetShowModelSelector,
  onSetActiveModel,
  onOpenContextOverlay,
  setShowComparePanel,
  handleValuesCheck,
  handleTimelineView,
  handleDecisionMap,
  handleLiveSearch,
  onDeleteAdvice,
  onExportAudit,
  onExportManifest,
  // v5.0 NEW PROPS
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
}) => {
  const currentTheme = themes[theme] || themes.dark;
  const { redactSensitive, getAuditTrail, getManifest } = useLocalMemory();

  // === REFLECTION LOOP TOGGLE ===
  const [localReflectionMode, setLocalReflectionMode] = React.useState(reflectionMode || false);

  const toggleReflection = () => {
    const next = !localReflectionMode;
    setLocalReflectionMode(next);
    onSendMessage(
      next 
        ? "Enter reflection mode. I want to process what I’ve learned." 
        : "Return to exploration."
    );
  };

  // === EXPORT HELPERS ===
  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAudit = () => {
    const audit = getAuditTrail();
    downloadFile(JSON.stringify(audit, null, 2), `brahma-audit-${Date.now()}.json`, "application/json");
  };

  const exportManifest = () => {
    const manifest = getManifest();
    downloadFile(JSON.stringify(manifest, null, 2), "brahma-manifest.json", "application/json");
  };

  // === BRANCHING UI ===
  const BranchSelector = () => {
    if (!branches || branches.length <= 1) return null;
    return (
      <div className="flex items-center gap-2 p-2 bg-black/10 border-b">
        <GitBranch size={16} className="text-purple-400" />
        <select
          value={currentBranch}
          onChange={(e) => onSwitchBranch(e.target.value)}
          className={`text-xs px-2 py-1 rounded bg-gray-800 text-white border border-white/20`}
        >
          {branches.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        <button
          onClick={onBranchFrom}
          className="text-xs px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded text-white"
        >
          Branch
        </button>
      </div>
    );
  };

  return (
    <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
      
      {/* 1. LEFT: SageChat + Triad + Reflection + Branching */}
      <div className={`lg:col-span-2 ${currentTheme.glass} rounded-xl overflow-hidden border flex flex-col`}>
        
        {/* Header */}
        <div className={`bg-gradient-to-r ${currentTheme.accent} bg-opacity-20 p-4 border-b ${theme === "dark" || theme === "cosmic" || theme === "void" ? "border-white/10" : "border-gray-200/50"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 bg-gradient-to-r ${currentTheme.accent} rounded-full flex items-center justify-center`}>
                <BrainCircuit size={18} className="text-white" />
              </div>
              <div>
                <h3 className={`font-semibold ${currentTheme.text.primary}`}>
                  {mode === "education" ? "Education Explorer" : "Decision Explorer"}
                </h3>
                <p className={`text-xs ${currentTheme.text.secondary} opacity-80`}>
                  {currentAgent} • {currentMode} • {currentModel}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={onSaveHistory} className={`px-3 py-1.5 text-xs rounded-lg ${currentTheme.glass} hover:bg-white/20 border transition-colors`} title="Save">
                Save
              </button>
              <button onClick={onOpenHistory} className={`px-3 py-1.5 text-xs rounded-lg ${currentTheme.glass} hover:bg-white/20 border transition-colors`} title="History">
                History
              </button>
            </div>
          </div>
        </div>
        
        {/* Branching */}
        <BranchSelector />

        {/* Triad Buttons */}
        <div className="p-3 border-b">
          <div className="flex justify-around items-center gap-3">
            {[
              { icon: Globe, label: "Simulate", action: onOpenSimulation, color: "text-red-500" },
              { icon: TrendingUp, label: "Timeline", action: handleTimelineView, color: "text-cyan-500" },
              { icon: Users, label: "Map", action: handleDecisionMap, color: "text-lime-500" },
            ].map((btn, i) => (
              <button
                key={i}
                onClick={btn.action}
                className={`flex-1 flex flex-col items-center justify-center p-2 rounded-lg transition-colors border ${currentTheme.glass} hover:bg-white/20`}
                title={btn.label}
              >
                <btn.icon size={20} className={btn.color} />
                <span className={`text-xs mt-1 ${currentTheme.text.secondary}`}>{btn.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Reflection Toggle */}
        <div className="p-2 border-b bg-black/10">
          <button
            onClick={toggleReflection}
            className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-medium transition-all ${
              localReflectionMode 
                ? "bg-purple-600 text-white" 
                : `${currentTheme.glass} border hover:bg-white/20`
            }`}
          >
            <MessageCircle size={14} />
            {localReflectionMode ? "Exit Reflection" : "Enter Reflection Mode"}
          </button>
        </div>

        {/* SageChat */}
        <div className="flex-grow overflow-y-auto">
          <SageChat
            conversations={conversations}
            onSendMessage={onSendMessage}
            isTyping={isTyping}
            settings={settings}
            theme={theme}
            onOpenContextOverlay={onOpenContextOverlay}
            userData={{ sage: { name: sageName } }}
            currentAgent={currentAgent}
            currentMode={currentMode}
            currentModel={currentModel}
            onDeleteAdvice={onDeleteAdvice}
            onExportAudit={onExportAudit || exportAudit}
            onExportManifest={onExportManifest || exportManifest}
            onRegenerate={onRegenerate}
            onFeedback={onFeedback}
          />
        </div>
      </div>

      {/* 2. RIGHT: Quick Actions + Possibility Cards + v5.0 Panels */}
      <div className="space-y-4">
        
        {/* Model & Agent Selector */}
        {showModelSelector && (
          <ModelSelector
            currentAgent={currentAgent}
            currentMode={currentMode}
            currentModel={currentModel}
            availableAgents={availableAgents}
            availableModes={availableModes}
            availableModels={availableModels}
            onSetActiveModel={onSetActiveModel}
            onSetShowModelSelector={onSetShowModelSelector}
            theme={theme}
          />
        )}

        {/* Quick Actions */}
        <div className={`${currentTheme.glass} rounded-xl border p-4`}>
          <h3 className={`font-semibold ${currentTheme.text.primary} mb-4 flex items-center gap-2`}>
            <Zap size={18} /> Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {[
              { icon: Scale, label: "Compare Options", color: "text-blue-600", action: () => setShowComparePanel?.(true) },
              { icon: Target, label: "Values Check", color: "text-green-600", action: handleValuesCheck },
              { icon: Clock, label: "Timeline View", color: "text-amber-600", action: handleTimelineView },
              { icon: Map, label: "Decision Map", color: "text-purple-600", action: handleDecisionMap },
              { icon: Search, label: "Live Search", color: "text-cyan-600", action: handleLiveSearch },
              { icon: Ghost, label: "GhostScan", color: "text-pink-500", action: () => window.dispatchEvent(new CustomEvent('run-ghost-scan')) },
              { icon: BarChart3, label: "Value Visualizer", color: "text-emerald-500", action: () => window.dispatchEvent(new CustomEvent('open-value-visualizer')) },
            ].map((action, i) => (
              <button
                key={i}
                onClick={action.action}
                className={`flex items-center gap-3 p-3 ${currentTheme.glass} border rounded-lg hover:bg-white/20 transition-all text-left`}
              >
                <action.icon size={20} className={action.color} />
                <span className={`text-sm font-medium ${currentTheme.text.primary}`}>{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Empathy-First Prompts */}
        <div className={`${currentTheme.glass} rounded-xl border p-4`}>
          <h3 className={`text-sm font-semibold ${currentTheme.text.primary} mb-3 flex items-center gap-2`}>
            <Lightbulb size={16} /> Empathy Prompts
          </h3>
          <div className="space-y-2">
            {[
              "I want to understand this deeply. Can you walk me through it like a friend?",
              "What would this feel like in real life? Show me the human side.",
              "Help me see the trade-offs, not just the numbers.",
              "I’m feeling uncertain. Can you reflect this back to me?",
            ].map((prompt, i) => (
              <button
                key={i}
                onClick={() => onSendMessage(prompt)}
                className={`text-left text-xs p-2 rounded-lg ${currentTheme.glass} border hover:bg-white/10 transition-all`}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Possibility Cards */}
        <div className={`${currentTheme.glass} rounded-xl border`}>
          <div className={`flex items-center justify-between p-4 border-b ${theme === "dark" || theme === "cosmic" || theme === "void" ? "border-white/10" : "border-gray-200/50"}`}>
            <h3 className={`text-lg font-semibold ${currentTheme.text.primary}`}>
              {mode === "education" ? "Education Paths" : "Possibility Cards"}
            </h3>
            <button
              onClick={() => setShowDecisionOptions(v => !v)}
              className={`text-xs px-3 py-1.5 rounded-lg ${currentTheme.glass} border`}
            >
              {showDecisionOptions ? "Hide" : "Show"}
            </button>
          </div>
          {showDecisionOptions && (
            <div className="p-4 sm:p-6">
              <div className={`text-xs ${currentTheme.text.muted} mb-3`}>
                {options.length} paths • {pinnedOptions.size} pinned • {branches?.length || 1} branches
              </div>
              <div className="space-y-4 max-h-[40rem] overflow-y-auto pr-1">
                {options.map((option) => (
                  <OptionCard
                    key={option.id}
                    option={option}
                    onExplore={onExploreOption}
                    onPin={onPinOption}
                    onArchive={onArchiveOption}
                    isPinned={pinnedOptions.has(option.id)}
                    onSimulate={onOpenSimulation}
                    theme={theme}
                    showMetrics={true}
                    showSource={true}
                    currentBranch={currentBranch}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Education Tools */}
        {mode === "education" && showQuickActions && (
          <div className={`${currentTheme.glass} rounded-xl border`}>
            <div className={`flex items-center justify-between p-4 border-b ${theme === "dark" || theme === "cosmic" || theme === "void" ? "border-white/10" : "border-gray-200/50"}`}>
              <h4 className={`text-sm font-semibold ${currentTheme.text.primary}`}>Education Tools</h4>
              <button onClick={() => setShowQuickActions(v => !v)} className={`text-xs px-3 py-1.5 rounded-lg ${currentTheme.glass} border`}>Hide</button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2">
              <button className={`px-3 py-2 rounded-lg text-xs transition-colors ${currentTheme.glass} border`}>ROI Estimator</button>
              <button className={`px-3 py-2 rounded-lg text-xs transition-colors ${currentTheme.glass} border`}>Time to Completion</button>
              <button className={`px-3 py-2 rounded-lg text-xs transition-colors ${currentTheme.glass} border`}>Curriculum Fit</button>
              <button onClick={onOpenSimulation} className={`px-3 py-2 rounded-lg text-xs transition-colors ${currentTheme.glass} border`}>What-If</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DecisionExplorer;