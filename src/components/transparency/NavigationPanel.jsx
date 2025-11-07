// src/components/transparency/NavigationPanel.jsx
import React from "react";
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
  Layers,
  Search,
  BookOpen,
} from "lucide-react";
import EnhancedTooltip from "../common/EnhancedTooltip.jsx";
import { themes } from "../common/themes.js"; // ✅ corrected import path

// Helper component for navigation buttons
function NavButton({ active, onClick, icon, label, isSpecial, theme, badge }) {
  const currentTheme = themes[theme] || themes.dark;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 relative transform hover:scale-[1.02] ${
        active
          ? `${currentTheme.glass} ${currentTheme.text.primary} shadow-lg`
          : isSpecial
          ? `${currentTheme.text.secondary} bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20`
          : `${currentTheme.text.secondary} hover:${currentTheme.glass.replace(
              "bg-white/10",
              "bg-white/5"
            )}`
      }`}
      title={label}
    >
      <span className="text-lg group-hover:scale-110 transition-transform duration-300">
        {icon}
      </span>
      <span className="text-sm font-medium">{label}</span>
      {badge && (
        <span className="ml-auto text-[10px] bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-2 py-0.5 rounded-full font-medium">
          {badge}
        </span>
      )}
      {isSpecial && (
        <>
          <span className="ml-auto text-[10px] bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-0.5 rounded-full font-medium">
            LIVE
          </span>
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse" />
        </>
      )}
      {active && (
        <div
          className={`absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl -z-10`}
        />
      )}
    </button>
  );
}

const NavigationPanel = ({
  navOpen,
  setNavOpen,
  currentView,
  mode,
  setMode,
  onNavigate,
  onToggleOverlay,
  hasLifetimePrivacy,
  theme,
}) => {
  const currentTheme = themes[theme] || themes.dark;

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setNavOpen((v) => !v)}
        className={`fixed z-40 top-5 left-5 ${currentTheme.glass} border rounded-xl px-3 py-2 text-sm hover:scale-105 transition-all duration-300 shadow-lg`}
        aria-label="Toggle navigation"
        title={navOpen ? "Close navigation" : "Open navigation"}
      >
        <span className="text-lg">☰</span>
      </button>

      {/* Navigation panel */}
      <aside
        className={`fixed z-30 top-0 left-0 h-full w-72 ${currentTheme.nav} border-r shadow-2xl transition-transform duration-300 ${
          navOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-5 pt-14 pb-4">
          <div className={`text-xs ${currentTheme.text.secondary} mb-1`}>
            Brahma
          </div>
          <h2
            className={`text-lg font-semibold bg-gradient-to-r ${currentTheme.accent} bg-clip-text text-transparent`}
          >
            Transparency Engine
          </h2>

          {/* Mode selector */}
          <div className="mt-4">
            <div
              className={`text-[11px] ${currentTheme.text.secondary} mb-2`}
            >
              Mode
            </div>
            <div
              className={`flex rounded-lg overflow-hidden border ${currentTheme.glass}`}
            >
              <button
                onClick={() => setMode("career")}
                className={`flex-1 px-3 py-2 text-sm transition ${
                  mode === "career"
                    ? `bg-gradient-to-r ${currentTheme.accent} text-white shadow-lg`
                    : `${currentTheme.text.secondary} hover:${currentTheme.glass.replace(
                        "bg-white/40",
                        "bg-white/20"
                      )}`
                }`}
              >
                💼 Career
              </button>
              <button
                onClick={() => setMode("education")}
                className={`flex-1 px-3 py-2 text-sm transition ${
                  mode === "education"
                    ? `bg-gradient-to-r ${currentTheme.accent} text-white shadow-lg`
                    : `${currentTheme.text.secondary} hover:${currentTheme.glass.replace(
                        "bg-white/40",
                        "bg-white/20"
                      )}`
                }`}
              >
                🎓 Education
              </button>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="px-2 space-y-1 overflow-y-auto pb-24 h-[calc(100%-170px)]">
          {/* Main Functions */}
          <NavButton
            active={currentView === "transparency"}
            onClick={() => onNavigate("transparency")}
            icon={<Compass size={20} />}
            label="Decision Explorer"
            theme={theme}
          />
          <NavButton
            active={currentView === "intelligence"}
            onClick={() => onNavigate("intelligence")}
            icon={<Brain size={20} />}
            label="Intelligence Engine"
            theme={theme}
          />
          <NavButton
            active={currentView === "memory"}
            onClick={() => onNavigate("memory")}
            icon={<BookOpen size={20} />}
            label="Memory Wisdom"
            theme={theme}
            badge="NEW"
          />
          <NavButton
            active={currentView === "artifacts"}
            onClick={() => onNavigate("artifacts")}
            icon={<Layers size={20} />}
            label="Artifact Gallery"
            theme={theme}
          />

          <div
            className={`h-px my-3 ${
              theme === "dark" || theme === "cosmic" || theme === "void"
                ? "bg-white/10"
                : "bg-gray-200/50"
            }`}
          />

          {/* Tools & Utils */}
          <NavButton
            onClick={() => onToggleOverlay("showLiveSearch", true)}
            icon={<Search size={20} />}
            label="Live Web Search"
            isSpecial
            theme={theme}
          />
          <NavButton
            active={currentView === "temporal"}
            onClick={() => onNavigate("temporal")}
            icon={<Calendar size={20} />}
            label="Temporal Intelligence"
            theme={theme}
          />
          <NavButton
            active={currentView === "language"}
            onClick={() => onNavigate("language")}
            icon={<MessageCircle size={20} />}
            label="Language Tools"
            theme={theme}
          />
          <NavButton
            active={currentView === "translate"}
            onClick={() => onNavigate("translate")}
            icon={<Wrench size={20} />}
            label="Translate & Listen"
            theme={theme}
          />
          <NavButton
            onClick={() => onToggleOverlay("showSandbox", true)}
            icon={<Microscope size={20} />}
            label="Reflection Sandbox"
            theme={theme}
          />

          <div
            className={`h-px my-3 ${
              theme === "dark" || theme === "cosmic" || theme === "void"
                ? "bg-white/10"
                : "bg-gray-200/50"
            }`}
          />

          {/* User-Centric */}
          <NavButton
            active={currentView === "avatar"}
            onClick={() => onNavigate("avatar")}
            icon={<User size={20} />}
            label="Avatar Lab"
            theme={theme}
          />
          <NavButton
            onClick={() => onToggleOverlay("showHistory", true)}
            icon={<Book size={20} />}
            label="Chat History"
            theme={theme}
          />
          <NavButton
            onClick={() => onToggleOverlay("showDataShadow", true)}
            icon={<Zap size={20} />}
            label="Data Shadow"
            theme={theme}
          />

          {!hasLifetimePrivacy && (
            <EnhancedTooltip
              content="Your data stays on your device — no cloud storage required"
              position="right"
              theme={theme}
            >
              <NavButton
                onClick={() => onToggleOverlay("showPrivacyContract", true)}
                icon={<Star size={20} />}
                label="Privacy Mode"
                theme={theme}
              />
            </EnhancedTooltip>
          )}
        </nav>

        {/* Settings anchored bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/10 flex gap-2">
          <NavButton
            onClick={() => onToggleOverlay("showSettings", true)}
            icon={<Settings size={20} />}
            label="Settings"
            theme={theme}
          />
        </div>
      </aside>
    </>
  );
};

export default NavigationPanel;