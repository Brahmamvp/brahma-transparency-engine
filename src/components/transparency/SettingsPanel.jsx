// /src/components/SettingsPanel.jsx

import React, { useEffect, useMemo, useState } from "react";
import {
  X,
  Sliders,
  Eye,
  Accessibility,
  Shield,
  Gauge,
  Cpu,
  Database,
  Sparkles,
  Zap,
  FolderOpen,
  Scale,
  Volume2, // 🎙️ NEW: Volume icon for Narration status
  Feather, // 💡 NEW ICON FOR VISUAL NARRATIVE
} from "lucide-react";

// 🆕 Triad & Safety storage/audit
import {
  getTriadSettings,
  setTriadSettings,
  getSafety,
  setSafety,
  audit,
  clearAudit,
  getAuditLogs,
} from "../../kernel/memoryKernel.js";

// 🧠 NEW GOVERNANCE IMPORTS
import GovernanceAgent from "../../agents/GovernanceAgent.js";
import governanceConfig from "../../config/governance.json"; // Keep this import for metadata

// 🧩 ACF IMPORTS
import { driftScanIfDue, getConsent, clearConsent } from "../../Lib/acf/consent.js";
import * as ACF from "../../Lib/acf/runtime.js"; // For clearAll

/* tiny inline toast (no dependency) */
function toast(text) {
  try {
    const t = document.createElement("div");
    t.className =
      "fixed top-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-xs z-[10000]";
    t.textContent = text;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 1800);
  } catch {}
}

/* ===== Tabs Config ===== */
const TABS = [
  { key: "general", label: "General", icon: Sliders },
  { key: "display", label: "Display", icon: Eye },
  { key: "celebrations", label: "Celebrations", icon: Sparkles },
  { key: "voice", label: "Voice & Audio", icon: Zap },
  { key: "access", label: "Accessibility", icon: Accessibility },
  { key: "privacy", label: "Privacy", icon: Shield },
  { key: "governance", label: "Governance", icon: Scale },
  { key: "integrations", label: "Integrations", icon: FolderOpen },
  { key: "advanced", label: "Advanced", icon: Gauge },
];

/* ===== Celebration Variants ===== */
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

/* =============================
   🧩 Consent Review Component
==============================*/
const ConsentReview = ({ consents, onClear }) => {
  if (!consents || consents.length === 0) {
    return (
      <div className="text-gray-400">
        <h3 className="text-white font-semibold mb-3">Consent Records</h3>
        <p>No consent records found. Adaptive features are ready to use.</p>
        <button
          onClick={onClear}
          className="mt-2 px-3 py-1 text-xs rounded bg-red-600 text-white"
        >
          Clear All (Reset)
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-white font-semibold">
          Consent Records ({consents.length})
        </h3>
        <button
          onClick={onClear}
          className="px-3 py-1 text-xs rounded bg-red-600 hover:bg-red-700 text-white"
        >
          Clear All
        </button>
      </div>
      <div className="max-h-48 overflow-y-auto bg-black/10 p-3 rounded-lg border border-white/10">
        {consents
          .slice(-10)
          .reverse()
          .map((rec, i) => (
            <div
              key={i}
              className="text-xs border-b border-white/5 py-2 last:border-b-0"
            >
              <div className="text-purple-300">
                {new Date(rec.createdAt).toLocaleString()}
              </div>
              <div className="text-gray-300">
                Scope: {rec.scope} | Action: {rec.action}
              </div>
              {rec.details.pii && (
                <div className="text-red-400">
                  PII: Sensitive data involved
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

/* =============================
   🧠 Policy Library Component
==============================*/
const PolicyLibrary = () => {
  const [policies, setPolicies] = useState(null);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  useEffect(() => {
    try {
      const fetchedPolicies = GovernanceAgent.fetchPolicies();
      setPolicies(fetchedPolicies);
      if (fetchedPolicies && fetchedPolicies.length > 0) {
        setSelectedPolicy(fetchedPolicies[0]);
      }
    } catch (error) {
      console.error("Failed to fetch policies:", error);
      setPolicies([]);
    }
  }, []);

  if (!policies) {
    return (
      <div className="text-gray-400">
        <h3 className="text-white font-semibold mb-3">Policy Library</h3>
        <p>Loading policies...</p>
      </div>
    );
  }

  if (policies.length === 0 || !selectedPolicy) {
    return (
      <div className="text-gray-400">
        <h3 className="text-white font-semibold mb-3">Policy Library</h3>
        <p>
          No governance policies found. Check <code>governance.json</code>.
        </p>
      </div>
    );
  }

  const status = governanceConfig.governance_status || "N/A";
  const lastUpdated = governanceConfig.lastUpdated || "N/A";

  return (
    <section className="policy-library space-y-4">
      <h3 className="text-white font-semibold">Brahma Policy Library</h3>
      <p className="text-xs text-purple-200/70">
        Status: {status} | Last Updated: {lastUpdated}
      </p>

      <div className="flex flex-col md:flex-row gap-6 bg-white/5 p-4 rounded-xl border border-white/10">
        {/* Policy List Sidebar */}
        <div className="md:w-1/3 space-y-1">
          {policies.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPolicy(p)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                selectedPolicy.id === p.id
                  ? "bg-purple-600/50 text-white font-medium"
                  : "text-purple-200 hover:bg-white/10"
              }`}
            >
              <span className="font-mono text-xs mr-2 opacity-70">{p.id}</span>
              {p.title}
            </button>
          ))}
        </div>

        {/* Policy Detail View */}
        <div className="md:w-2/3 p-4 border border-white/10 rounded-lg bg-black/10">
          <h4 className="text-lg text-white font-bold mb-2">
            {selectedPolicy.title}
          </h4>
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedPolicy.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs rounded-full bg-pink-600/30 text-pink-300"
              >
                #{tag}
              </span>
            ))}
          </div>
          <p className="text-gray-300 mb-6">{selectedPolicy.summary}</p>

          <div className="mt-4 border-t border-white/10 pt-4">
            <h5 className="text-sm font-semibold text-purple-300">
              Changelog / Context
            </h5>
            <p className="text-xs text-gray-400 mt-1">
              {selectedPolicy.changelog}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ===== Settings Panel ===== */
const SettingsPanel = ({
  onClose,
  userData,
  onSettingsChange,
  onOpenMemorySettings,
  onOpenVoiceModulator,
  onOpenSoulTimeline,
  // 🎙️ VOICE PROPS
  isNarrationPlaying,
  toggleNarration,
  // 🚨 FIXED PROPS
  onOpenPrivacyContract,
  onOpenDataShadow, // 🚨 NEW PROP
  onOpenConsentReview, // 🧩 NEW ACF PROP
}) => {
  const [activeTab, setActiveTab] = useState("general");
  const [testCelebration, setTestCelebration] = useState(null);
  const [celebrationTimeout, setCelebrationTimeout] = useState(null);

  // 🚨 AUDIT LOGS STATE
  const [auditLogs, setAuditLogs] = useState([]);

  // 🧩 ACF State
  const [nextDriftDue, setNextDriftDue] = useState(null);
  const [consents, setConsents] = useState([]);

  // Existing local UI settings (persisted to localStorage)
  const [localSettings, setLocalSettings] = useState({
    showParticles: (localStorage.getItem("brahma_show_particles") ?? "true") !== "false",
    showAvatar: (localStorage.getItem("brahma_show_avatar") ?? "true") !== "false",
    reducedMotion: (localStorage.getItem("brahma_reduced_motion") ?? "false") === "true",
    compactMode: (localStorage.getItem("brahma_compact_mode") ?? "false") === "true",
    highContrast: (localStorage.getItem("brahma_high_contrast") ?? "false") === "true",
    fontScale: Number(localStorage.getItem("brahma_font_scale") ?? 100),
    celebrationType: localStorage.getItem("brahma_celebrationType") ?? "confetti",
    celebrationDuration: Number(localStorage.getItem("brahma_celebrationDuration") ?? 5),
    celebrationIntensity: Number(localStorage.getItem("brahma_celebrationIntensity") ?? 3),
    voiceEnabled: (localStorage.getItem("brahma_voiceEnabled") ?? "true") !== "false",
    voiceRate: Number(localStorage.getItem("brahma_voiceRate") ?? 1),
    voicePitch: Number(localStorage.getItem("brahma_voicePitch") ?? 1),
    voiceVolume: Number(localStorage.getItem("brahma_voiceVolume") ?? 0.8),
    soundEffects: (localStorage.getItem("brahma_soundEffects") ?? "true") !== "false",
    ambientSounds: (localStorage.getItem("brahma_ambientSounds") ?? "false") === "true",
    screenReader: (localStorage.getItem("brahma_screenReader") ?? "false") === "true",
    keyboardNav: (localStorage.getItem("brahma_keyboardNav") ?? "true") !== "false",
    focusIndicators: (localStorage.getItem("brahma_focusIndicators") ?? "true") !== "false",
    analyticsEnabled: (localStorage.getItem("brahma_analyticsEnabled") ?? "false") === "true",
    crashReporting: (localStorage.getItem("brahma_crashReporting") ?? "false") === "true",
    debugMode: (localStorage.getItem("brahma_debugMode") ?? "false") === "true",
    experimentalFeatures: (localStorage.getItem("brahma_experimentalFeatures") ?? "false") === "true",
  });

  /* Triad and Safety logic remains unchanged */
  const triadInit = useMemo(() => getTriadSettings(), []);
  const [curiosity, setCuriosity] = useState(
    typeof triadInit?.curiosityLevel === "number" ? triadInit.curiosityLevel : 0.5
  );
  const [iseLevel, setIseLevel] = useState(triadInit?.iseLevel ?? 2);
  const [ambient, setAmbient] = useState(!!triadInit?.ambientPresence);
  // 💡 NEW STATE INIT: Visual Narrative
  const [visualNarrative, setVisualNarrative] = useState(!!triadInit?.visual_narrative_enabled);

  const [triad, setTriad] = useState({
    curiosityLevel: curiosity,
    iseLevel,
    ambientPresence: ambient,
    ac_enabled: !!triadInit?.ac_enabled,
    // 💡 NEW STATE FIELD
    visual_narrative_enabled: visualNarrative,
  });

  useEffect(() => {
    try {
      setAuditLogs(getAuditLogs());
      setConsents(getConsent());
      onSettingsChange(localSettings);

      Object.entries(localSettings).forEach(([key, value]) => {
        localStorage.setItem(`brahma_${key}`, String(value));
      });
    } catch (e) {
      console.error("Error saving settings or running audit:", e);
    }
  }, [localSettings, onSettingsChange]);

  useEffect(() => {
    const records = getConsent();
    const memoryRecords = records.filter((r) => r.scope === "memory");
    if (!memoryRecords.length) {
      setNextDriftDue("due now");
      return;
    }

    const latest = new Date(memoryRecords[memoryRecords.length - 1].createdAt);
    const now = new Date();
    const diffDays = Math.floor((now - latest) / (1000 * 60 * 60 * 24));
    const daysUntil = 90 - diffDays;
    setNextDriftDue(daysUntil <= 0 ? "due now" : daysUntil);
  }, []);

  /* Audit Log Functions */
  const handleClearLogs = () => {
    clearAudit();
    setAuditLogs([]);
    toast("Audit logs cleared");
  };

  /* ACF Clear Function */
  const handleClearACF = () => {
    if (confirm("Clear all adaptive memory and consent records? This resets Sage's continuity.")) {
      ACF.clearAll();
      clearConsent();
      setConsents([]);
      audit("acf_cleared_by_user");
      toast("Adaptive memory cleared");
    }
  };

  /* Manual Drift Scan */
  const handleManualDriftScan = () => {
    const isDue = driftScanIfDue({ periodDays: 90 });
    if (isDue) {
      window.dispatchEvent(new CustomEvent("acf-drift-due", { detail: { manual: true } }));
      toast("Drift scan triggered – check your conversation for review prompts.");
    } else {
      toast("No drift scan needed yet.");
    }
    setNextDriftDue("scanned");
  };

  /* Celebration test */
  const testCelebrationEffect = () => {
    if (celebrationTimeout) clearTimeout(celebrationTimeout);
    setTestCelebration(localSettings.celebrationType);
    const timeout = setTimeout(() => {
      setTestCelebration(null);
      setCelebrationTimeout(null);
    }, localSettings.celebrationDuration * 1000);
    setCelebrationTimeout(timeout);
  };

  const toggle = (key) => setLocalSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  const setNumber = (key, value) =>
    setLocalSettings((prev) => ({ ...prev, [key]: Number(value) }));
  const setValue = (key, value) =>
    setLocalSettings((prev) => ({ ...prev, [key]: value }));

  /* Triad and Safety logic */
  const saveTriad = () => {
    // 💡 CRITICAL UPDATE: Save the new field
    setTriadSettings({
      curiosityLevel: triad.curiosityLevel,
      iseLevel: triad.iseLevel,
      ambientPresence: triad.ambientPresence,
      ac_enabled: triad.ac_enabled,
      visual_narrative_enabled: triad.visual_narrative_enabled, 
    });
    audit("triad_user_saved", { ...triad });
    toast("Triad settings saved");
  };

  const handleTriadChange = (key, value) => {
    setTriad((prev) => ({ ...prev, [key]: value }));
    if (key === "curiosityLevel") setCuriosity(value);
    if (key === "iseLevel") setIseLevel(value);
    if (key === "ambientPresence") setAmbient(value);
    if (key === "visual_narrative_enabled") setVisualNarrative(value); // 💡 NEW HANDLER
  };

  const safetyInit = useMemo(() => getSafety(), []);
  const [ec, setEc] = useState(
    safetyInit?.emergencyContact || { name: "", relation: "", phone: "", email: "" }
  );

  const saveEC = () => {
    const has = !!ec.name?.trim();
    setSafety({ emergencyContact: has ? ec : null });
    audit("consent_emergency_contact_set", { has });
    toast(has ? "Emergency contact saved" : "Emergency contact cleared");
  };

  /* Celebration visuals */
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

  /* Consent Review Handler */
  const handleConsentReview = () => {
    if (onOpenConsentReview) {
      onOpenConsentReview(consents);
    } else {
      toast(`Found ${consents.length} consent records. Use global modal for full view.`);
      audit("consent_review_opened", { count: consents.length });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {renderCelebration()}

      <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-gradient-to-r from-purple-600/20 to-pink-600/20">
          <h2 className="text-xl font-semibold text-white">Settings</h2>
          <button onClick={onClose} className="text-gray-300 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <aside className="hidden md:block w-56 border-r border-white/10 p-4 bg-white/5">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${
                  activeTab === key
                    ? "bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-white"
                    : "text-purple-200 hover:bg-white/10"
                }`}
              >
                <span>
                  {typeof Icon === "string" ? Icon : <Icon className="w-4 h-4" />}
                </span>
                {label}
              </button>
            ))}

            <div className="mt-6 pt-4 border-t border-white/10 space-y-2">
              <QuickOpen
                icon={<Sparkles className="w-4 h-4" />}
                label="Memory Settings"
                onClick={onOpenMemorySettings}
              />
              <QuickOpen
                icon={<Zap className="w-4 h-4" />}
                label="Voice Modulator"
                onClick={onOpenVoiceModulator}
              />
              <QuickOpen
                icon={<Cpu className="w-4 h-4" />}
                label="Soul Timeline"
                onClick={onOpenSoulTimeline}
              />
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
            {activeTab === "general" && (
              <Section title="General">
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
                <ToggleRow
                  label="Compact Mode"
                  value={localSettings.compactMode}
                  onChange={() => toggle("compactMode")}
                />
              </Section>
            )}

            {activeTab === "display" && (
              <Section title="Display">
                <ToggleRow
                  label="Reduced Motion"
                  value={localSettings.reducedMotion}
                  onChange={() => toggle("reducedMotion")}
                />
                <ToggleRow
                  label="High Contrast"
                  value={localSettings.highContrast}
                  onChange={() => toggle("highContrast")}
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
              <Section title="Celebrations">
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

            {/* 🎙️ Voice & Audio Tab */}
            {activeTab === "voice" && (
              <Section title="Voice & Audio">
                <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                  <span className="text-sm text-white flex items-center gap-2">
                    <Volume2
                      className={`w-4 h-4 ${
                        isNarrationPlaying ? "text-green-400" : "text-gray-400"
                      }`}
                    />
                    Narration Status:
                  </span>
                  <button
                    onClick={toggleNarration}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      isNarrationPlaying
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                  >
                    {isNarrationPlaying
                      ? "Stop Context Narration"
                      : "Start Context Narration"}
                  </button>
                </div>

                <ToggleRow
                  label="Enable Voice Response"
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
                <ToggleRow
                  label="Sound Effects"
                  value={localSettings.soundEffects}
                  onChange={() => toggle("soundEffects")}
                />
                <ToggleRow
                  label="Ambient Sounds"
                  value={localSettings.ambientSounds}
                  onChange={() => toggle("ambientSounds")}
                />
              </Section>
            )}

            {activeTab === "privacy" && (
              <Section title="Privacy">
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

            {activeTab === "governance" && <PolicyLibrary />}

            {activeTab === "integrations" && (
              <Section title="Integrations">
                <p className="text-gray-400">Future: API + external services.</p>
              </Section>
            )}

            {/* Advanced Tab */}
            {activeTab === "advanced" && (
              <>
                <Section title="Advanced & Privacy">
                  <Tile
                    icon={<Shield className="w-5 h-5 text-emerald-400" />}
                    title="Privacy Contract"
                    desc="Review or activate your Lifetime Privacy agreement."
                    actionLabel="Open"
                    onClick={onOpenPrivacyContract}
                  />
                  <Tile
                    icon={<Database className="w-5 h-5 text-blue-300" />}
                    title="Data Shadow"
                    desc="See and manage your latent profile."
                    actionLabel="Open"
                    onClick={onOpenDataShadow}
                  />
                </Section>

                {/* 🧩 Consent + Triad Controls */}
                <Section title="Adaptive Continuity (ACF)">
                  <p className="text-xs text-gray-300 mb-3">
                    ACF enables adaptive memory, relational stance, and visual cues.
                  </p>
                  
                  <ToggleRow
                    label="Enable Adaptive Continuity"
                    value={triad.ac_enabled || false}
                    onChange={(e) =>
                      handleTriadChange("ac_enabled", e.target.checked)
                    }
                  />

                  {/* 💡 NEW TOGGLE: VISUAL NARRATIVE */}
                  <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Feather className="w-4 h-4 text-pink-400" />
                      <label className="text-sm text-white">
                        Enable Visual Narratives
                      </label>
                    </div>
                    <input
                      type="checkbox"
                      checked={triad.visual_narrative_enabled || false}
                      onChange={(e) =>
                        handleTriadChange(
                          "visual_narrative_enabled",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 accent-purple-600"
                    />
                  </div>
                  {/* ---------------------------------- */}
                  
                  <button
                    onClick={handleConsentReview}
                    className="mt-4 px-4 py-2 text-sm font-medium rounded-lg bg-purple-600/30 text-purple-200 hover:bg-purple-700/60 transition"
                  >
                    Review Consent Records
                  </button>

                  <div className="flex gap-2 mt-3 items-center">
                    <div className="text-xs text-gray-400">
                      Next consent review due in:{" "}
                      <span className="font-medium">
                        {nextDriftDue === "due now"
                          ? "Due now"
                          : nextDriftDue === "scanned"
                          ? "Recently scanned"
                          : `${nextDriftDue} days`}
                      </span>
                    </div>
                    <button
                      onClick={handleManualDriftScan}
                      className="text-xs px-2 py-1 bg-indigo-600 rounded text-white"
                    >
                      Scan Now
                    </button>
                  </div>

                  <button
                    onClick={handleClearACF}
                    className="mt-4 w-full px-4 py-2 text-sm rounded bg-red-600/30 text-red-200 hover:bg-red-700/60 transition"
                  >
                    Clear Adaptive Memory
                  </button>
                </Section>

                {/* 🧠 Triad Settings */}
                <Section title="Intent & Triad">
                  <label className="text-sm text-white">Curiosity Level</label>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={triad.curiosityLevel}
                    onChange={(e) =>
                      handleTriadChange(
                        "curiosityLevel",
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full mt-2"
                  />
                  <label className="text-sm text-white">Intent Level (ISE)</label>
                  <select
                    value={triad.iseLevel}
                    onChange={(e) =>
                      handleTriadChange("iseLevel", parseInt(e.target.value))
                    }
                    className="mt-2 border rounded px-2 py-2 text-sm w-full bg-white/70 text-gray-900"
                  >
                    <option value={1}>Level 1 — Quick Response</option>
                    <option value={2}>Level 2 — Relational Insight (Sage)</option>
                    <option value={3}>Level 3 — Structural Inquiry (Seer)</option>
                    <option value={4}>Level 4 — Embodied Praxis (Catalyst)</option>
                  </select>
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      id="ambientPresence"
                      type="checkbox"
                      checked={triad.ambientPresence}
                      onChange={() =>
                        handleTriadChange("ambientPresence", !triad.ambientPresence)
                      }
                    />
                    <label htmlFor="ambientPresence" className="text-sm text-white">
                      Ambient presence (opt-in)
                    </label>
                  </div>
                  <button
                    onClick={saveTriad}
                    className="mt-4 px-3 py-2 rounded bg-gray-800 text-white text-sm"
                  >
                    Save Triad settings
                  </button>
                </Section>

                {/* Safety */}
                <Section title="Safety (optional)">
                  <p className="text-xs text-gray-300 mb-3">
                    Add an emergency contact. Stored locally only.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      placeholder="Name"
                      value={ec.name}
                      onChange={(e) => setEc({ ...ec, name: e.target.value })}
                      className="border rounded px-2 py-2 text-sm bg-white/70 text-gray-900"
                    />
                    <input
                      placeholder="Relation (optional)"
                      value={ec.relation || ""}
                      onChange={(e) => setEc({ ...ec, relation: e.target.value })}
                      className="border rounded px-2 py-2 text-sm bg-white/70 text-gray-900"
                    />
                    <input
                      placeholder="Phone (optional)"
                      value={ec.phone || ""}
                      onChange={(e) => setEc({ ...ec, phone: e.target.value })}
                      className="border rounded px-2 py-2 text-sm bg-white/70 text-gray-900"
                    />
                    <input
                      placeholder="Email (optional)"
                      value={ec.email || ""}
                      onChange={(e) => setEc({ ...ec, email: e.target.value })}
                      className="border rounded px-2 py-2 text-sm bg-white/70 text-gray-900"
                    />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={saveEC}
                      className="px-3 py-2 rounded bg-gray-800 text-white text-sm"
                    >
                      Save contact
                    </button>
                    <button
                      onClick={() => {
                        setEc({ name: "", relation: "", phone: "", email: "" });
                        setSafety({ emergencyContact: null });
                        audit("consent_emergency_contact_set", { has: false });
                        toast("Emergency contact removed");
                      }}
                      className="px-3 py-2 rounded bg-red-600 text-white text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </Section>

                {/* Audit Logs */}
                <Section title="Audit Logs & Debug">
                  <p className="text-xs text-gray-300 mb-3">
                    Immutable log of internal actions and consents.
                  </p>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-400">
                      Total Logs: {auditLogs.length}
                    </span>
                    <button
                      onClick={handleClearLogs}
                      className="px-3 py-1 text-xs rounded-lg bg-red-800 hover:bg-red-700 text-white"
                    >
                      Clear All Logs
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-scroll bg-black/10 p-2 rounded-lg text-xs font-mono text-gray-400 border border-white/5">
                    {auditLogs.length > 0 ? (
                      auditLogs
                        .slice()
                        .reverse()
                        .map((log, index) => {
                          const payload = Object.fromEntries(
                            Object.entries(log).filter(
                              ([k]) => k !== "timestamp" && k !== "category"
                            )
                          );
                          return (
                            <div
                              key={index}
                              className="border-b border-white/5 py-1"
                            >
                              <span className="text-purple-300 mr-2">
                                [{new Date(log.timestamp).toLocaleTimeString()}]
                              </span>
                              <span className="text-white font-semibold">
                                {log.category}
                              </span>
                              {Object.keys(payload).length > 0 && (
                                <span>: {JSON.stringify(payload)}</span>
                              )}
                            </div>
                          );
                        })
                    ) : (
                      <p className="text-center py-4">
                        No audit events recorded yet.
                      </p>
                    )}
                  </div>
                </Section>

                {/* Consent Review Inline */}
                <ConsentReview consents={consents} onClear={handleClearACF} />
              </>
            )}
          </main>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
          <div className="text-xs text-purple-200/70">
            Changes save automatically to your device.
          </div>
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* ===== Helper Components (No changes needed here) ===== */
function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h3 className="text-white font-semibold mb-3">{title}</h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function ToggleRow({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
      <span className="text-sm text-white">{label}</span>
      <input
        type="checkbox"
        checked={value}
        onChange={onChange}
        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
      />
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
        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg dark:bg-gray-700"
      />
      <div className="text-xs text-gray-400">
        {value}
        {unit}
      </div>
    </div>
  );
}

function Tile({ icon, title, desc, actionLabel, onClick }) {
  return (
    <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-start justify-between mb-3">
      <div className="flex items-start gap-3">
        <div className="shrink-0">{icon}</div>
        <div>
          <div className="text-sm text-white font-medium">{title}</div>
          <div className="text-xs text-gray-400">{desc}</div>
        </div>
      </div>
      <button
        onClick={onClick}
        className="px-3 py-1.5 text-xs rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white"
      >
        {actionLabel}
      </button>
    </div>
  );
}

function QuickOpen({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs bg-white/5 hover:bg-white/10 text-purple-200"
    >
      {icon}
      {label}
    </button>
  );
}

export default SettingsPanel;
