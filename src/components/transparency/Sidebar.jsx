// src/components/transparency/Sidebar.jsx
import React, { useState } from "react";
import {
  Brain,
  MessageCircle,
  Book,
  Compass,
  Settings,
  User,
  Wrench,
  Star,
  Zap,
  Microscope,
  Calendar,
  Layers, // 🟢 LAYERS ICON USED FOR CONTEXT
  Search,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Palette,
  Building, // 🟢 NEW: ICON IMPORT
} from "lucide-react";
import EnhancedTooltip from "../common/EnhancedTooltip.jsx";
import { themes } from "../../styles/themes.js";

// Icon-only navigation button for collapsed state
const IconNavButton = ({ active, onClick, icon, label, isSpecial, badge, settings }) => (
  <EnhancedTooltip content={label} position="right" theme={settings.theme}>
    <button
      onClick={onClick}
      className={`w-12 h-12 rounded-xl transition-all duration-300 flex items-center justify-center relative group ${
        active
          ? "bg-white/15 shadow-lg backdrop-blur-md"
          : "hover:bg-white/5 backdrop-blur-md"
      }`}
    >
      <span
        className={`text-lg ${
          active ? "text-white" : "text-white/80 group-hover:text-white"
        } ${isSpecial ? "text-cyan-300" : ""} transition-all duration-300 group-hover:scale-110`}
      >
        {icon}
      </span>
      {badge && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full flex items-center justify-center">
          <span className="text-[8px] text-white font-bold">!</span>
        </span>
      )}
      {isSpecial && (
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse" />
      )}
      {active && <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />}
    </button>
  </EnhancedTooltip>
);

// Expanded navigation button
const NavButton = ({ active, onClick, icon, label, isSpecial, badge }) => (
  <button
    onClick={onClick}
    className={`w-full py-2.5 px-3 rounded-lg transition-all duration-300 flex items-center gap-3 relative group ${
      active
        ? "bg-white/15 shadow-lg backdrop-blur-md text-white"
        : "hover:bg-white/5 backdrop-blur-md text-white/80 hover:text-white"
    }`}
  >
    <span
      className={`text-lg ${
        isSpecial ? "text-cyan-300" : ""
      } transition-transform group-hover:scale-110 duration-300`}
    >
      {icon}
    </span>
    <span className="text-sm font-medium flex-1">{label}</span>
    {badge && (
      <span className="text-[10px] bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-2 py-0.5 rounded-full font-medium">
        {badge}
      </span>
    )}
    {isSpecial && (
      <span className="text-[10px] bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-0.5 rounded-full font-medium">
        LIVE
      </span>
    )}
    {active && <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />}
  </button>
);

const Sidebar = ({
  navOpen,
  setNavOpen,
  currentView,
  handleNavigate,
  settings,
  mode,
  setMode,
  track,
  setTrack,
  hasLifetimePrivacy,
  setShowPrivacyContract,
  setShowDataShadow,
  setShowSettings,
  setShowHistory,
  setShowThemePanel,
  theme,
  // setActiveTab has been removed from props
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showModePanel, setShowModePanel] = useState(false);
  const themeData = themes[settings.theme] || themes.dark;

  // Mode selection panel (omitted for brevity)
  const ModePanel = () => (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowModePanel(false)} />
      <div className="absolute left-20 top-20 bg-white/5 backdrop-blur-xl rounded-2xl p-6 min-w-72 border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Choose Your Path</h3>
          <button
            onClick={() => setShowModePanel(false)}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        {/* Mode Selection */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-white/80 mb-3">Exploration Mode</h4>
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => {
                setMode("career");
                setShowModePanel(false);
              }}
              className={`p-4 rounded-xl border transition-all duration-300 text-left ${
                mode === "career"
                  ? "bg-white/15 border-white/20 shadow-lg"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">💼</span>
                <div>
                  <div className="text-white font-medium">Career</div>
                  <div className="text-white/60 text-xs">Professional decisions & growth</div>
                </div>
              </div>
            </button>
            <button
              onClick={() => {
                setMode("education");
                setShowModePanel(false);
              }}
              className={`p-4 rounded-xl border transition-all duration-300 text-left ${
                mode === "education"
                  ? "bg-white/15 border-white/20 shadow-lg"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎓</span>
                <div>
                  <div className="text-white font-medium">Education</div>
                  <div className="text-white/60 text-xs">Learning paths & skill development</div>
                </div>
              </div>
            </button>
          </div>
        </div>
        {/* Track Selection */}
        <div>
          <h4 className="text-sm font-medium text-white/80 mb-3">Intelligence Track</h4>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setTrack("human");
                setShowModePanel(false);
              }}
              className={`p-3 rounded-xl border transition-all duration-300 ${
                track === "human"
                  ? "bg-white/15 border-white/20 shadow-lg"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              <div className="text-center">
                <div className="text-lg mb-1">👤</div>
                <div className="text-white text-sm font-medium">Human</div>
              </div>
            </button>
            <button
              onClick={() => {
                setTrack("agent");
                setShowModePanel(false);
              }}
              className={`p-3 rounded-xl border transition-all duration-300 ${
                track === "agent"
                  ? "bg-white/15 border-white/20 shadow-lg"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              <div className="text-center">
                <div className="text-lg mb-1">🤖</div>
                <div className="text-white text-sm font-medium">Agent</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle (omitted for brevity) */}
      <button
        onClick={() => setNavOpen((prev) => !prev)}
        className="fixed z-40 top-5 left-5 lg:hidden p-3 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg hover:scale-105 transition-all duration-300"
        aria-label="Toggle navigation"
      >
        {navOpen ? <X size={20} className="text-white" /> : <Menu size={20} className="text-white" />}
      </button>
      {/* Mobile overlay (omitted for brevity) */}
      {navOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setNavOpen(false)}
        />
      )}
      {/* Main Sidebar */}
      <aside
        className={`fixed z-30 top-0 left-0 h-full transition-all duration-500 ease-out ${
          isCollapsed ? "w-16" : "w-64"
        } ${navOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        bg-white/5 backdrop-blur-3xl border-r border-white/10`}
      >
        {/* Content */}
        <div className="relative h-full flex flex-col">
          {/* Header (omitted for brevity) */}
          <div className={`${isCollapsed ? "p-3" : "p-5"} border-b border-white/10`}>
            <div className="flex items-center justify-between">
              {!isCollapsed && (
                <div className="flex-1">
                  <div className="text-xs text-white/60 mb-2 font-medium uppercase tracking-wide">
                    Brahma
                  </div>
                  <h2 className="text-lg font-light text-white mb-1">Transparency Engine</h2>
                  <p className="text-xs text-white/60 mb-3">Compassionate clarity for decisions</p>
                  {/* Mode indicator (omitted for brevity) */}
                  <button
                    onClick={() => setShowModePanel(true)}
                    className="w-full p-2.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{mode === "career" ? "💼" : "🎓"}</span>
                        <div className="text-left">
                          <div className="text-white text-sm font-medium">
                            {mode === "career" ? "Career" : "Education"} • {track === "human" ? "Human" : "Agent"}
                          </div>
                          <div className="text-white/60 text-xs">Tap to change</div>
                        </div>
                      </div>
                      <ChevronRight
                        size={16}
                        className="text-white/60 group-hover:text-white transition-colors"
                      />
                    </div>
                  </button>
                </div>
              )}
              {/* Collapse toggle (desktop only) */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 hidden lg:block backdrop-blur-sm"
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? <ChevronRight size={16} className="text-white" /> : <ChevronLeft size={16} className="text-white" />}
              </button>
            </div>
          </div>
          {/* Navigation */}
          <nav className={`flex-1 ${isCollapsed ? "px-2 py-4" : "px-4 py-5"} space-y-2 overflow-y-auto`}>
            {/* Core Functions */}
            {!isCollapsed && (
              <div className="text-[10px] text-white/40 mb-2 px-2 font-medium tracking-wide uppercase">
                Core Functions
              </div>
            )}
            {isCollapsed ? (
              <>
                <IconNavButton
                  active={currentView === "transparency"}
                  onClick={() => handleNavigate("transparency")}
                  icon={<Compass size={20} />}
                  label="Decision Explorer"
                  settings={settings}
                />
                <IconNavButton
                  active={currentView === "intelligence"}
                  onClick={() => handleNavigate("intelligence")}
                  icon={<Brain size={20} />}
                  label="Intelligence Engine"
                  settings={settings}
                />
                <IconNavButton
                  active={currentView === "memory"}
                  onClick={() => handleNavigate("memory")}
                  icon={<BookOpen size={20} />}
                  label="Memory Wisdom"
                  badge="NEW"
                  settings={settings}
                />
                {/* 🟢 NEW: CONTEXT ENGINE (Collapsed) */}
                <IconNavButton
                  active={currentView === "context"}
                  onClick={() => handleNavigate("context")}
                  icon={<Layers size={20} />}
                  label="Context Engine"
                  settings={settings}
                />
                {/* END OF CONTEXT ADDITION */}
                
                <IconNavButton
                  active={currentView === "agentstudio"}
                  onClick={() => handleNavigate("agentstudio")}
                  icon={<Microscope size={20} />}
                  label="Agent Studio"
                  settings={settings}
                />
                {/* 🟢 NEW: ENTERPRISE DASHBOARD BUTTON (Collapsed) */}
                <IconNavButton
                  active={currentView === "enterprise"}
                  onClick={() => handleNavigate("enterprise")}
                  icon={<Building size={20} />}
                  label="Enterprise Dashboard"
                  settings={settings}
                />
                
                <IconNavButton
                  active={currentView === "artifacts"}
                  onClick={() => handleNavigate("artifacts")}
                  icon={<Layers size={20} />}
                  label="Artifact Gallery"
                  settings={settings}
                />
                <div className="h-px my-3 bg-white/10" />
                <IconNavButton
                  onClick={() => handleNavigate("search")}
                  icon={<Search size={20} />}
                  label="Live Web Search"
                  isSpecial
                  settings={settings}
                />
                <IconNavButton
                  active={currentView === "temporal"}
                  onClick={() => handleNavigate("temporal")}
                  icon={<Calendar size={20} />}
                  label="Temporal Intelligence"
                  settings={settings}
                />
                <IconNavButton
                  active={currentView === "language"}
                  onClick={() => handleNavigate("language")}
                  icon={<MessageCircle size={20} />}
                  label="Language Tools"
                  settings={settings}
                />
                <IconNavButton
                  active={currentView === "translate"}
                  onClick={() => handleNavigate("translate")}
                  icon={<Wrench size={20} />}
                  label="Translate & Listen"
                  settings={settings}
                />
                <div className="h-px my-3 bg-white/10" />
                <IconNavButton
                  active={currentView === "avatar"}
                  onClick={() => handleNavigate("avatar")}
                  icon={<User size={20} />}
                  label="Avatar Lab"
                  settings={settings}
                />
                <IconNavButton
                  onClick={() => setShowHistory(true)}
                  icon={<Book size={20} />}
                  label="Chat History"
                  settings={settings}
                />
                <IconNavButton
                  onClick={() => setShowSettings(true)}
                  icon={<Settings size={20} />}
                  label="Settings"
                  settings={settings}
                />
                <IconNavButton
                  onClick={() => setShowDataShadow(true)}
                  icon={<Zap size={20} />}
                  label="Data Shadow"
                  settings={settings}
                />
                {!hasLifetimePrivacy && (
                  <IconNavButton
                    onClick={() => setShowPrivacyContract(true)}
                    icon={<Star size={20} />}
                    label="Privacy Mode"
                    settings={settings}
                  />
                )}
              </>
            ) : (
              <>
                <NavButton
                  active={currentView === "transparency"}
                  onClick={() => handleNavigate("transparency")}
                  icon={<Compass size={20} />}
                  label="Decision Explorer"
                />
                <NavButton
                  active={currentView === "intelligence"}
                  onClick={() => handleNavigate("intelligence")}
                  icon={<Brain size={20} />}
                  label="Intelligence Engine"
                />
                <NavButton
                  active={currentView === "memory"}
                  onClick={() => handleNavigate("memory")}
                  icon={<BookOpen size={20} />}
                  label="Memory Wisdom"
                  badge="NEW"
                />
                {/* 🟢 NEW: CONTEXT ENGINE (Expanded) */}
                <NavButton
                  active={currentView === "context"}
                  onClick={() => handleNavigate("context")}
                  icon={<Layers size={20} />}
                  label="Context Engine"
                  isSpecial={currentView === "context"} // Optionally highlight it
                />
                {/* END OF CONTEXT ADDITION */}
                
                <NavButton
                  active={currentView === "agentstudio"}
                  onClick={() => handleNavigate("agentstudio")}
                  icon={<Microscope size={20} />}
                  label="Agent Studio"
                />
                {/* 🟢 NEW: ENTERPRISE DASHBOARD BUTTON (Expanded) */}
                <NavButton
                  active={currentView === "enterprise"}
                  onClick={() => handleNavigate("enterprise")}
                  icon={<Building size={20} />}
                  label="Enterprise Dashboard"
                />
                
                <NavButton
                  active={currentView === "artifacts"}
                  onClick={() => handleNavigate("artifacts")}
                  icon={<Layers size={20} />}
                  label="Artifact Gallery"
                />
                <div className="h-px my-4 bg-white/10" />
                <div className="text-[10px] text-white/40 mb-2 px-2 font-medium tracking-wide uppercase">
                  Tools & Utilities
                </div>
                <NavButton
                  onClick={() => handleNavigate("search")}
                  icon={<Search size={20} />}
                  label="Live Web Search"
                  isSpecial
                />
                <NavButton
                  active={currentView === "temporal"}
                  onClick={() => handleNavigate("temporal")}
                  icon={<Calendar size={20} />}
                  label="Temporal Intelligence"
                />
                <NavButton
                  active={currentView === "language"}
                  onClick={() => handleNavigate("language")}
                  icon={<MessageCircle size={20} />}
                  label="Language Tools"
                />
                <NavButton
                  active={currentView === "translate"}
                  onClick={() => handleNavigate("translate")}
                  icon={<Wrench size={20} />}
                  label="Translate & Listen"
                />
                <div className="h-px my-4 bg-white/10" />
                <div className="text-[10px] text-white/40 mb-2 px-2 font-medium tracking-wide uppercase">
                  Personal Space
                </div>
                <NavButton
                  active={currentView === "avatar"}
                  onClick={() => handleNavigate("avatar")}
                  icon={<User size={20} />}
                  label="Avatar Lab"
                />
                <NavButton
                  onClick={() => setShowHistory(true)}
                  icon={<Book size={20} />}
                  label="Chat History"
                />
                <NavButton
                  onClick={() => setShowSettings(true)}
                  icon={<Settings size={20} />}
                  label="Settings"
                />
                <NavButton
                  onClick={() => setShowDataShadow(true)}
                  icon={<Zap size={20} />}
                  label="Data Shadow"
                />
                {!hasLifetimePrivacy && (
                  <EnhancedTooltip
                    content="Your data stays on your device — no cloud storage required"
                    position="right"
                    theme={settings.theme}
                  >
                    <NavButton
                      onClick={() => setShowPrivacyContract(true)}
                      icon={<Star size={20} />}
                      label="Privacy Mode"
                    />
                  </EnhancedTooltip>
                )}
              </>
            )}
          </nav>
          {/* Footer */}
          <div className={`${isCollapsed ? "p-3" : "p-5"} border-t border-white/10`}>
            {isCollapsed ? (
              <div className="space-y-2">
                {/* 🟢 NEW: CONTEXT QUICK ACCESS (Collapsed Footer) - NOW USES handleNavigate */}
                <EnhancedTooltip content={"Open Context"} position="right" theme={settings.theme}>
                  <button
                    onClick={() => handleNavigate("context")}
                    className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500/80 to-purple-500/80 hover:bg-white/20 transition-colors flex items-center justify-center backdrop-blur-sm"
                  >
                    <Layers size={16} className="text-white" />
                  </button>
                </EnhancedTooltip>
                {/* END OF CONTEXT QUICK ACCESS */}
                <EnhancedTooltip content="Settings" position="right" theme={settings.theme}>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center backdrop-blur-sm"
                  >
                    <Settings size={16} className="text-white" />
                  </button>
                </EnhancedTooltip>
                <EnhancedTooltip content={`Theme: ${themeData.name}`} position="right" theme={settings.theme}>
                  <button
                    onClick={() => setShowThemePanel(true)}
                    className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center backdrop-blur-sm"
                  >
                    <Palette size={16} className="text-white" />
                  </button>
                </EnhancedTooltip>
              </div>
            ) : (
              <>
                <div className="flex gap-2 mb-4">
                  {/* 🟢 NEW: CONTEXT QUICK ACCESS (Expanded Footer) - NOW USES handleNavigate */}
                  <button
                    onClick={() => handleNavigate("context")}
                    className="flex-1 p-3 rounded-xl bg-gradient-to-r from-indigo-500/80 to-purple-500/80 hover:opacity-90 transition-colors flex items-center justify-center gap-2 backdrop-blur-sm"
                  >
                    <Layers size={16} className="text-white" />
                    <span className="text-sm font-medium text-white">Open Context</span>
                  </button>
                  {/* END OF CONTEXT QUICK ACCESS */}
                </div>
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setShowSettings(true)}
                    className="flex-1 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-2 backdrop-blur-sm"
                  >
                    <Settings size={16} className="text-white" />
                    <span className="text-sm text-white">Settings</span>
                  </button>
                  <button
                    onClick={() => setShowThemePanel(true)}
                    className="flex-1 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-2 backdrop-blur-sm"
                  >
                    <Palette size={16} className="text-white" />
                    <span className="text-sm text-white">Theme</span>
                  </button>
                </div>
                <div className="text-center text-[10px] text-white/40 space-y-1">
                  <p>Your space for thoughtful exploration</p>
                  <p>Safe • Private • Yours</p>
                </div>
              </>
            )}
          </div>
        </div>
      </aside>
      {/* Mode Selection Panel */}
      {showModePanel && <ModePanel />}
    </>
  );
};

export default Sidebar;
