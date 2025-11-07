// src/components/transparency/SettingsPanel.jsx
import React, { useState } from "react";

/* ===== Tabs Config ===== */
const TABS = [
  { key: "general", label: "General", icon: "⚙️" },
  { key: "display", label: "Display", icon: "👁️" },
  { key: "celebrations", label: "Celebrations", icon: "🎉" },
  { key: "voice", label: "Voice & Audio", icon: "🔊" },
  { key: "access", label: "Accessibility", icon: "♿" },
  { key: "privacy", label: "Privacy", icon: "🛡️" },
  { key: "integrations", label: "Integrations", icon: "📁" },
  { key: "advanced", label: "Advanced", icon: "⚡" },
];

/* ===== Celebration Variants (only 3 kept) ===== */
const CELEBRATION_TYPES = {
  confetti: {
    name: "Confetti",
    description: "Classic falling confetti",
    icon: "🎊",
    colors: ["#FFD700", "#800080", "#FF69B4", "#00CED1"],
  },
  fireworks: {
    name: "Fireworks",
    description: "Bursting light effects",
    icon: "🎆",
    colors: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"],
  },
  glow: {
    name: "Glow Pulse",
    description: "Gentle glow animation",
    icon: "✨",
    colors: ["#E6E6FA", "#DDA0DD", "#DA70D6", "#FF69B4"],
  },
};

/* ===== Confetti Components ===== */
const ConfettiPiece = ({ delay, duration, color }) => (
  <div
    className="absolute w-2 h-2 opacity-80"
    style={{
      backgroundColor: color,
      left: `${Math.random() * 100}%`,
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
      transform: `rotate(${Math.random() * 360}deg)`,
      animation: `confettiFall ${duration}s linear infinite`,
    }}
  />
);

const CustomConfetti = ({ intensity, colors }) => {
  const pieces = [];
  const count = intensity * 30;
  for (let i = 0; i < count; i++) {
    pieces.push(
      <ConfettiPiece
        key={i}
        delay={Math.random() * 3}
        duration={3 + Math.random() * 2}
        color={colors[Math.floor(Math.random() * colors.length)]}
      />
    );
  }
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[9999]">
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {pieces}
    </div>
  );
};

/* ===== Settings Panel ===== */
const SettingsPanel = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState("general");
  const [testCelebration, setTestCelebration] = useState(null);
  const [celebrationTimeout, setCelebrationTimeout] = useState(null);

  const [localSettings, setLocalSettings] = useState({
    showParticles: true,
    showAvatar: true,
    reducedMotion: false,
    fontScale: 100,
    celebrationType: "confetti",
    celebrationDuration: 5,
    celebrationIntensity: 3,
    voiceEnabled: true,
    voiceRate: 1,
    voicePitch: 1,
    voiceVolume: 0.8,
    soundEffects: true,
    ambientSounds: false,
    screenReader: false,
    keyboardNav: true,
    focusIndicators: true,
    analyticsEnabled: false,
    crashReporting: false,
    debugMode: false,
    experimentalFeatures: false,
  });

  /* ===== Celebration Test ===== */
  const testCelebrationEffect = () => {
    if (celebrationTimeout) clearTimeout(celebrationTimeout);
    setTestCelebration(localSettings.celebrationType);
    const timeout = setTimeout(() => {
      setTestCelebration(null);
      setCelebrationTimeout(null);
    }, localSettings.celebrationDuration * 1000);
    setCelebrationTimeout(timeout);
  };

  /* ===== Helpers ===== */
  const toggle = (key) =>
    setLocalSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  const setNumber = (key, value) =>
    setLocalSettings((prev) => ({ ...prev, [key]: Number(value) }));

  const setValue = (key, value) =>
    setLocalSettings((prev) => ({ ...prev, [key]: value }));

  /* ===== Render Celebrations ===== */
  const renderCelebration = () => {
    if (testCelebration === "confetti") {
      return (
        <CustomConfetti
          intensity={localSettings.celebrationIntensity}
          colors={CELEBRATION_TYPES.confetti.colors}
        />
      );
    }
    if (testCelebration === "glow") {
      return (
        <div className="fixed inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 animate-pulse z-[9999]" />
      );
    }
    if (testCelebration === "fireworks") {
      return (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
          {[...Array(localSettings.celebrationIntensity)].map((_, i) => (
            <div
              key={i}
              className="absolute w-32 h-32 rounded-full animate-ping"
              style={{
                background: `radial-gradient(circle, ${
                  CELEBRATION_TYPES.fireworks.colors[
                    i % CELEBRATION_TYPES.fireworks.colors.length
                  ]
                }40 0%, transparent 70%)`,
                left: `${Math.random() * 80 + 10}%`,
                top: `${Math.random() * 60 + 20}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: "1.5s",
              }}
            />
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      {renderCelebration()}

      <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-gradient-to-r from-purple-600/20 to-pink-600/20">
          <h2 className="text-xl font-semibold text-white">Settings</h2>
          <button onClick={onClose} className="text-gray-300 hover:text-white">
            ✖
          </button>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <aside className="hidden md:block w-56 border-r border-white/10 p-4 bg-white/5">
            {TABS.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${
                  activeTab === key
                    ? "bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-white"
                    : "text-purple-200 hover:bg-white/10"
                }`}
              >
                <span>{icon}</span>
                {label}
              </button>
            ))}
          </aside>

          {/* Content */}
          <main className="flex-1 p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
            {activeTab === "general" && (
              <Section title="General" icon="⚙️">
                <ToggleRow
                  label="Show Particles"
                  value={localSettings.showParticles}
                  onChange={() => toggle("showParticles")}
                />
                <ToggleRow
                  label="Show Avatar"
                  value={localSettings.showAvatar}
                  onChange={() => toggle("showAvatar")}
                />
              </Section>
            )}

            {activeTab === "display" && (
              <Section title="Display" icon="👁️">
                <ToggleRow
                  label="Reduced Motion"
                  value={localSettings.reducedMotion}
                  onChange={() => toggle("reducedMotion")}
                />
                <SliderRow
                  label="Font Scale"
                  value={localSettings.fontScale}
                  onChange={(v) => setNumber("fontScale", v)}
                  min={80}
                  max={140}
                  step={10}
                  unit="%"
                />
              </Section>
            )}

            {activeTab === "celebrations" && (
              <Section title="Celebrations" icon="🎉">
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(CELEBRATION_TYPES).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setValue("celebrationType", key)}
                      className={`p-3 rounded-lg border ${
                        localSettings.celebrationType === key
                          ? "border-purple-400 bg-purple-600/30"
                          : "border-white/20 bg-white/5"
                      }`}
                    >
                      <div className="text-2xl">{config.icon}</div>
                      <div>{config.name}</div>
                    </button>
                  ))}
                </div>
                <SliderRow
                  label="Duration"
                  value={localSettings.celebrationDuration}
                  onChange={(v) => setNumber("celebrationDuration", v)}
                  min={1}
                  max={20}
                  step={1}
                  unit="s"
                />
                <SliderRow
                  label="Intensity"
                  value={localSettings.celebrationIntensity}
                  onChange={(v) => setNumber("celebrationIntensity", v)}
                  min={1}
                  max={5}
                  step={1}
                />
                <button
                  onClick={testCelebrationEffect}
                  className="mt-4 w-full px-4 py-2 bg-purple-600 rounded-lg text-white"
                >
                  Test {CELEBRATION_TYPES[localSettings.celebrationType].name}
                </button>
              </Section>
            )}

            {activeTab === "voice" && (
              <Section title="Voice & Audio" icon="🔊">
                <ToggleRow
                  label="Enable Voice"
                  value={localSettings.voiceEnabled}
                  onChange={() => toggle("voiceEnabled")}
                />
                <SliderRow
                  label="Rate"
                  value={localSettings.voiceRate}
                  onChange={(v) => setNumber("voiceRate", v)}
                  min={0.5}
                  max={2}
                  step={0.1}
                />
                <SliderRow
                  label="Pitch"
                  value={localSettings.voicePitch}
                  onChange={(v) => setNumber("voicePitch", v)}
                  min={0.5}
                  max={2}
                  step={0.1}
                />
                <SliderRow
                  label="Volume"
                  value={localSettings.voiceVolume}
                  onChange={(v) => setNumber("voiceVolume", v)}
                  min={0}
                  max={1}
                  step={0.1}
                />
              </Section>
            )}

            {activeTab === "access" && (
              <Section title="Accessibility" icon="♿">
                <ToggleRow
                  label="Screen Reader Mode"
                  value={localSettings.screenReader}
                  onChange={() => toggle("screenReader")}
                />
                <ToggleRow
                  label="Keyboard Navigation"
                  value={localSettings.keyboardNav}
                  onChange={() => toggle("keyboardNav")}
                />
                <ToggleRow
                  label="Focus Indicators"
                  value={localSettings.focusIndicators}
                  onChange={() => toggle("focusIndicators")}
                />
              </Section>
            )}

            {activeTab === "privacy" && (
              <Section title="Privacy" icon="🛡️">
                <ToggleRow
                  label="Enable Analytics"
                  value={localSettings.analyticsEnabled}
                  onChange={() => toggle("analyticsEnabled")}
                />
                <ToggleRow
                  label="Crash Reporting"
                  value={localSettings.crashReporting}
                  onChange={() => toggle("crashReporting")}
                />
              </Section>
            )}

            {activeTab === "integrations" && (
              <Section title="Integrations" icon="📁">
                <p className="text-gray-400">Future: API + external services.</p>
              </Section>
            )}

            {activeTab === "advanced" && (
              <Section title="Advanced" icon="⚡">
                <ToggleRow
                  label="Debug Mode"
                  value={localSettings.debugMode}
                  onChange={() => toggle("debugMode")}
                />
                <ToggleRow
                  label="Experimental Features"
                  value={localSettings.experimentalFeatures}
                  onChange={() => toggle("experimentalFeatures")}
                />
              </Section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

/* ===== Helper Components ===== */
function Section({ title, icon, children }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-white/10">
        <span>{icon}</span>
        <h3 className="text-white font-semibold text-lg">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function ToggleRow({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
      <span className="text-sm text-white">{label}</span>
      <input type="checkbox" checked={value} onChange={onChange} />
    </div>
  );
}

function SliderRow({ label, value, onChange, min, max, step, unit }) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-white">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full"
      />
      <div className="text-xs text-gray-400">
        {value}
        {unit}
      </div>
    </div>
  );
}

export default SettingsPanel;