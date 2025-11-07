import React from "react";
import {
  MessageCircle, Send, Mic, Heart, Lightbulb, Scale, Eye, Clock, 
  DollarSign, Target, Compass, BookOpen, Star, Volume2, VolumeX, 
  MoreHorizontal, Pin, Archive, Share2, Sparkles, Brain, Zap, 
  ChevronDown, ChevronRight, Calendar, Map, Layers, Settings, 
  Download, Upload, Trash2, Save, RotateCcw, Search, AlertTriangle, 
  X, Play, Pause, RefreshCw, Copy, ExternalLink, GitBranch, 
  FileText, History, Plus, Minus, Tag, BrainCircuit, Home // NEW ICON IMPORT
} from "lucide-react";
import {
  SageAvatar, ClearChatModal, SaveBranchModal, OptionCard, 
  InsightCard, PrivacyBadge, BranchModal, Section, EmptyState
} from "./SageUtils.jsx";
import DecisionMapPanel from "../DecisionMapPanel.jsx";
import CatalystPanel from "../CatalystPanel.jsx";
// FIX: Changed to named import for SeerPanel (matches export const in SeerPanel.jsx)
import { SeerPanel } from "../SeerPanel.jsx";
// NEW IMPORT FOR NARRATIVE RENDERER
import NarrativeRenderer from "./visuals/NarrativeRenderer.jsx"; 
import ContextEngineRoot from "../../context-engine/ContextEngineRoot.jsx";

// Main UI Layout for SageJourneyOrchestrator
const SageDashboard = ({
  userData, theme, conversations, message, setMessage, handleSendMessage, 
  handleKeyPress, chatEndRef, inputRef, isTyping, sageName, voiceEnabled, 
  setVoiceEnabled, isPlaying, stopSpeaking, isListening, isSupported, 
  startListening, stopListening, showClearModal, setShowClearModal, 
  clearConversation, branches, showSaveBranchModal, setShowSaveBranchModal, 
  saveAsBranch, showBranchModal, setShowBranchModal, loadBranch, deleteBranch, 
  lastAction, handleUndo, options, insights, expandedOptions, handleExploreOption, 
  handlePinOption, handleArchiveOption, handleToggleExpanded, activeTab, 
  setActiveTab, promptTemplates, exportConversation, importConversation, 
  handleValuesCheck, handleTimelineView, handleDecisionMap, handleLiveSearch, 
  startNewJourney, setShowComparePanel, onOpenContextOverlay, 
  currentView, // PROP FOR CONDITIONAL RENDERING
  handleReturnToDashboard, // PROP FOR DECISION MAP EXIT
  agentConfig, // Passed from Orchestrator for ACF flags
}) => {
  const pinnedOptions = options.filter((opt) => opt.pinned);
  const regularOptions = options.filter((opt) => !opt.pinned);

  // Conditional Rendering based on currentView set by the Orchestrator
  if (currentView === "decisionMap") {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation back to Dashboard */}
        <div className="flex justify-end p-4">
          <button
            onClick={handleReturnToDashboard}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
          >
            <Home size={16} /> Return to Dashboard
          </button>
        </div>
        
        {/* Decision Map Component */}
        <DecisionMapPanel 
          options={options} 
          insights={insights} 
          actions={{
            handlePinOption,
            handleExploreOption,
          }}
          theme={theme}
          agentConfig={agentConfig} // Pass ACF config for integrity checks
        />
      </div>
    );
  }

  // --- Default Dashboard View ---
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-light text-gray-800">
          Journey with {sageName}
        </h1>
        <p className="text-gray-600 text-lg">
          Decision exploration through compassionate dialogue
        </p>
      </div>

      {/* Tab Navigation (only visible in Dashboard view) */}
      <div className={`${theme.glass} border rounded-xl p-2 flex`} role="tablist">
        {[
          {
            id: "conversation",
            label: "Conversation",
            icon: MessageCircle,
            count: conversations.length,
          },
          { id: "options", label: "Options", icon: Compass, count: options.length },
          { id: "insights", label: "Insights", icon: Sparkles, count: insights.length },
          { id: "context", label: "Context", icon: BrainCircuit, count: 0 }, // Added Context Tab
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all font-medium ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
            }`}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${
                  activeTab === tab.id
                    ? "bg-white/20"
                    : "bg-white/30 text-gray-600"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2">
          
          {/* Conversation Tab Content */}
          {activeTab === "conversation" && (
            <div className={`${theme.glass} border rounded-xl overflow-hidden`}>
              {/* Chat Header */}
              <div className="bg-white/40 backdrop-blur-sm p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SageAvatar mood="peaceful" isThinking={isTyping} size="small" />
                  <div>
                    <h3 className="font-medium text-gray-800">{sageName}</h3>
                    <p className="text-xs text-gray-500">
                      {isTyping ? "Reflecting..." : "Here to listen and explore"}
                    </p>
                  </div>
                </div>

                {/* Controls (Context Overlay Button is CRITICAL here) */}
                <div className="flex items-center gap-1">
                  
                  {/* CONTEXT OVERLAY BUTTON - RESTORED */}
                  <button
                    onClick={onOpenContextOverlay} 
                    className="flex items-center gap-1 px-3 py-2 text-xs rounded-lg transition-colors bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 font-medium"
                    title="View Ambient Awareness Context"
                  >
                    <BrainCircuit size={16} />
                    Context
                  </button>
                  {/* --------------------------- */}
                  
                  <div className="relative group">
                    <button className="p-2 rounded-lg hover:bg-white/20 text-gray-600 hover:text-gray-800 transition-colors">
                      <Download size={16} />
                    </button>
                    <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-20 min-w-32 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => exportConversation("json")}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                      >
                        Export JSON
                      </button>
                      <button
                        onClick={() => exportConversation("markdown")}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                      >
                        Export Markdown
                      </button>
                    </div>
                  </div>

                  <label className="p-2 rounded-lg hover:bg-white/20 text-gray-600 hover:text-gray-800 transition-colors cursor-pointer">
                    <Upload size={16} />
                    <input
                      type="file"
                      accept=".json"
                      onChange={importConversation}
                      className="hidden"
                      title="Import conversation"
                    />
                  </label>

                  <button
                    onClick={() => setShowSaveBranchModal(true)}
                    className="p-2 rounded-lg hover:bg-white/20 text-gray-600 hover:text-gray-800 transition-colors"
                    title="Save as branch"
                  >
                    <GitBranch size={16} />
                  </button>

                  <button
                    onClick={() => setShowBranchModal(true)}
                    className="p-2 rounded-lg hover:bg-white/20 text-gray-600 hover:text-gray-800 transition-colors relative"
                    title="Manage branches"
                  >
                    <History size={16} />
                    {branches.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center">
                        {branches.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={startNewJourney}
                    className="p-2 rounded-lg hover:bg-white/20 text-gray-600 hover:text-blue-600 transition-colors"
                    title="Start new journey"
                  >
                    <Plus size={16} />
                  </button>

                  <button
                    onClick={() => setShowClearModal(true)}
                    className="p-2 rounded-lg hover:bg-white/20 text-gray-600 hover:text-red-600 transition-colors"
                    title="Clear conversation"
                  >
                    <Trash2 size={16} />
                  </button>

                  <div className="w-px h-6 bg-gray-300 mx-1" />

                  <button
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className={`p-2 rounded-lg transition-colors ${
                      voiceEnabled
                        ? "bg-blue-200 text-blue-700"
                        : "hover:bg-white/20 text-gray-600"
                    }`}
                    title={voiceEnabled ? "Disable voice" : "Enable voice"}
                  >
                    {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                  </button>

                  {isPlaying && (
                    <button
                      onClick={stopSpeaking}
                      className="p-2 rounded-lg bg-red-200 text-red-700 hover:bg-red-300 transition-colors animate-pulse"
                      title="Stop speaking"
                    >
                      <Pause size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Chat Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-4 scroll-smooth">
                {conversations.length === 0 ? (
                  <div className="text-center py-12">
                    <SageAvatar mood="peaceful" size="large" />
                    <div className="mt-4 text-gray-800">
                      <p className="text-lg font-medium mb-2">
                        Hello, I'm {sageName}
                      </p>
                      <p className="text-gray-600">
                        I'm here to hold space for your thoughts and help you
                        explore your decisions with clarity and compassion.
                      </p>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-2 justify-center">
                      {promptTemplates.map((prompt, index) => (
                        <button
                          key={index}
                          onClick={() => setMessage(prompt)}
                          className="px-4 py-2 text-sm bg-white/60 backdrop-blur-sm border border-white/60 rounded-full hover:bg-white/80 hover:shadow-md transition-all text-gray-600 hover:text-gray-800"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  conversations.map((conv, index) => {
                    // 🟢 System message handler
                    if (conv.type === "system") {
                      return (
                        <div key={index} className="flex justify-center relative">
                          {/* NARRATIVE RENDERER INTEGRATION */}
                          {conv.visual?.type === "cloudVideo" && (
                            <div className="absolute inset-0 z-10 rounded-xl overflow-hidden">
                              <NarrativeRenderer 
                                src={conv.visual.src} 
                                style={conv.visual.style} 
                              />
                            </div>
                          )}
                          {/* -------------------------------------------------- */}

                          <div className={`text-[11px] text-gray-500 bg-white/50 border border-white/60 rounded-full px-3 py-1 my-1 ${
                            conv.visual ? "z-20 relative bg-white/90" : "" // Keep text visible over visual
                          }`}>
                            {conv.content}
                          </div>
                        </div>
                      );
                    }

                    // Regular user/Sage messages
                    return (
                      <div
                        key={index}
                        className={`flex ${
                          conv.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md ${
                            conv.role === "user"
                              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white ml-auto"
                              : "bg-white/60 backdrop-blur-sm border border-white/60 text-gray-800 mr-auto"
                          } rounded-2xl px-4 py-3 shadow-sm group relative`}
                        >
                          <p className="leading-relaxed">{conv.content}</p>
                          <div
                            className={`text-xs mt-2 ${
                              conv.role === "user"
                                ? "text-white/70"
                                : "text-gray-500"
                            }`}
                          >
                            {conv.timestamp?.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>

                          {/* Hover Actions */}
                          <div className="absolute -top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-1 bg-white rounded-full px-2 py-1 shadow-lg">
                              <button
                                onClick={() =>
                                  navigator.clipboard.writeText(conv.content)
                                }
                                className="p-1 hover:bg-gray-100 rounded-full"
                                title="Copy message"
                              >
                                <Copy size={10} />
                              </button>
                              {conv.role === "sage" && voiceEnabled && (
                                <button
                                  onClick={() => stopSpeaking(conv.content)}
                                  className="p-1 hover:bg-gray-100 rounded-full"
                                  title="Read aloud"
                                >
                                  <Volume2 size={10} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white/60 backdrop-blur-sm border border-white/60 rounded-2xl px-4 py-3 mr-auto max-w-xs">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Prompt Input */}
              <div className="p-4 border-t bg-white/20">
                <div className="flex flex-wrap gap-2 mb-4">
                  {promptTemplates.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => setMessage(prompt)}
                      className="flex-1 min-w-[150px] px-3 py-2 text-sm bg-white/60 backdrop-blur-sm border border-white/60 rounded-full hover:bg-white/80 hover:shadow-md transition-all text-gray-600 hover:text-gray-800"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <textarea
                    ref={inputRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Share what's on your mind..."
                    rows={1}
                    className="flex-1 px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none text-gray-800 placeholder-gray-500"
                  />
                  {isSupported && (
                    <button
                      onClick={isListening ? stopListening : startListening}
                      className={`p-3 rounded-xl transition-all ${
                        isListening
                          ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                          : "bg-white/60 backdrop-blur-sm border border-white/60 hover:bg-white/80 text-gray-700"
                      }`}
                      title={
                        isListening ? "Stop listening" : "Start voice input"
                      }
                    >
                      <Mic size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!message.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all font-medium"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Options Tab Content */}
          {activeTab === "options" && (
            <div className="space-y-6">
              {pinnedOptions.length > 0 && (
                <Section
                  title="Pinned Options"
                  icon={<Pin size={18} className="text-amber-600" />}
                >
                  {pinnedOptions.map((opt) => (
                    <OptionCard
                      key={opt.id}
                      option={opt}
                      onExplore={handleExploreOption}
                      onPin={handlePinOption}
                      onArchive={handleArchiveOption}
                      isExpanded={expandedOptions.has(opt.id)}
                      onToggleExpand={handleToggleExpanded}
                      theme={theme}
                    />
                  ))}
                </Section>
              )}

              {regularOptions.length > 0 && (
                <Section title="Decision Paths">
                  {regularOptions.map((opt) => (
                    <OptionCard
                      key={opt.id}
                      option={opt}
                      onExplore={handleExploreOption}
                      onPin={handlePinOption}
                      onArchive={handleArchiveOption}
                      isExpanded={expandedOptions.has(opt.id)}
                      onToggleExpand={handleToggleExpanded}
                      theme={theme}
                    />
                  ))}
                </Section>
              )}

              {options.length === 0 && (
                <EmptyState
                  icon={<Compass size={48} className="text-gray-500" />}
                  text={`No decision paths yet. Share your thoughts with ${sageName} to begin exploring options.`}
                />
              )}
            </div>
          )}

          {/* Insights Tab Content */}
          {activeTab === "insights" && (
            <div className="space-y-4">
              {insights.length > 0 ? (
                insights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} theme={theme} />
                ))
              ) : (
                <EmptyState
                  icon={<Sparkles size={48} className="text-gray-500" />}
                  text={`Insights will appear as you explore your decisions with ${sageName}.`}
                />
              )}
            </div>
          )}

          {/* Context Tab Content (The fix!) */}
          {activeTab === "context" && <ContextEngineRoot />}

        </div>

        {/* Sidebar - CRITICAL for Triad Buttons and Compare Options */}
        <Sidebar
          theme={theme}
          setShowComparePanel={setShowComparePanel} // RESTORED
          handleValuesCheck={handleValuesCheck} // RESTORED (Triad)
          handleTimelineView={handleTimelineView}
          handleDecisionMap={handleDecisionMap} // RESTORED
          handleLiveSearch={handleLiveSearch}
          conversations={conversations}
          options={options}
          insights={insights}
          branches={branches}
          sageName={sageName}
          voiceEnabled={voiceEnabled}
          isSupported={isSupported}
        />
      </div>

      {/* Undo Toast */}
      {lastAction &&
        (lastAction === "clear" || lastAction === "delete-branch") && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-full shadow-lg z-50 flex items-center gap-4">
            <span>
              {lastAction === "clear"
                ? "Conversation cleared."
                : "Branch deleted."}
            </span>
            <button
              onClick={handleUndo}
              className="text-blue-400 font-semibold hover:text-blue-300"
            >
              <RotateCcw size={16} className="inline-block mr-1" />
              Undo
            </button>
          </div>
        )}

      {/* Modals - Include ClearChatModal, SaveBranchModal, and BranchModal here if they exist */}
      {showClearModal && (
        <ClearChatModal
          onClose={() => setShowClearModal(false)}
          onConfirm={clearConversation}
          sageName={sageName}
        />
      )}
      {showSaveBranchModal && (
        <SaveBranchModal
          onClose={() => setShowSaveBranchModal(false)}
          onSave={saveAsBranch}
        />
      )}
      {showBranchModal && (
        <BranchModal
          onClose={() => setShowBranchModal(false)}
          branches={branches}
          loadBranch={loadBranch}
          deleteBranch={deleteBranch}
        />
      )}
    </div>
  );
};

// ============================
// Sidebar Component
// ============================
const Sidebar = ({
  theme, setShowComparePanel, handleValuesCheck, handleTimelineView, 
  handleDecisionMap, handleLiveSearch, conversations, options, 
  insights, branches, sageName, voiceEnabled, isSupported,
}) => {
  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className={`${theme.glass} border rounded-xl p-4`}>
        <h3 className="font-medium text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-3">
          {[
            {
              icon: Scale,
              label: "Compare Options",
              color: "text-blue-600",
              action: () => setShowComparePanel(true), // RESTORED: Compare Options Button
            },
            {
              icon: Target,
              label: "Values Check",
              color: "text-green-600",
              action: handleValuesCheck, // RESTORED: Triad button
            },
            {
              icon: Clock,
              label: "Timeline View",
              color: "text-amber-600",
              action: handleTimelineView,
            },
            {
              icon: Map,
              label: "Decision Map",
              color: "text-purple-600",
              action: handleDecisionMap, // RESTORED: Decision Map Button
            },
            {
              icon: Search,
              label: "Live Search",
              color: "text-cyan-600",
              action: handleLiveSearch,
            },
          ].map((a, i) => (
            <button
              key={i}
              onClick={a.action}
              className="flex items-center gap-3 p-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-lg hover:bg-white/80 transition-all text-left"
            >
              <a.icon size={20} className={a.color} />
              <span className="text-sm font-medium text-gray-800">
                {a.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Session Summary */}
      <div className={`${theme.glass} border rounded-xl p-4`}>
        <h3 className="font-medium text-gray-800 mb-3">This Session</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Messages exchanged</span>
            <span className="text-gray-800">{conversations.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Options explored</span>
            <span className="text-gray-800">{options.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Insights generated</span>
            <span className="text-gray-800">{insights.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Journey branches</span>
            <span className="text-gray-800">{branches.length}</span>
          </div>
        </div>
      </div>

      {/* Sage Status */}
      <div className={`${theme.glass} border rounded-xl p-4`}>
        <div className="flex items-center gap-3 mb-3">
          <SageAvatar mood="peaceful" size="small" />
          <div>
            <h4 className="font-medium text-gray-800">{sageName}</h4>
            <p className="text-xs text-gray-500">Ready to explore</p>
          </div>
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-gray-500">Local processing active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-gray-500">Memory & insights enabled</span>
          </div>
          {voiceEnabled && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span className="text-gray-500">Voice responses enabled</span>
            </div>
          )}
          {isSupported && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span className="text-gray-500">Voice input supported</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SageDashboard;
