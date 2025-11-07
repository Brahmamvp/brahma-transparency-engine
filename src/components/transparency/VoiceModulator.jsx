// src/components/transparency/VoiceModulator.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  X,
  Waves,
  Volume2,
  Play,
  Pause,
  RefreshCw,
  Sparkles,
  Loader2,
} from "lucide-react";

/**
 * VoiceModulator
 * - Privacy-first (all local; no network)
 * - Uses Web Speech Synthesis API for Live Preview (if available)
 * - Persists settings to localStorage under 'brahma_voice_modulator'
 *
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - onApply?: (settings) => void // called when clicking "Apply"
 */
const VoiceModulator = ({ isOpen, onClose, onApply }) => {
  const LS_KEY = "brahma_voice_modulator";

  // Preset voice "profiles" (stylistic layer)
  const VOICE_TYPES = [
    { id: "zephyr", label: "Zephyr", desc: "Light, airy, kind" },
    { id: "orion", label: "Orion", desc: "Grounded, steady, warm" },
    { id: "nova", label: "Nova", desc: "Crisp, bright, articulate" },
    { id: "earthtone", label: "Earthtone", desc: "Low, calm, resonant" },
    { id: "silent", label: "Silent Echo", desc: "No audio (subtitles only)" },
  ];

  // Tone filters (semantic vibe)
  const TONES = [
    { id: "soothing", label: "Soothing" },
    { id: "energetic", label: "Energetic" },
    { id: "wise", label: "Wise" },
    { id: "curious", label: "Curious" },
  ];

  // Load persisted or default config
  const [config, setConfig] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(LS_KEY) || "null");
      if (raw && typeof raw === "object") return raw;
    } catch {}
    return {
      voiceType: "orion", // or zephyr/nova/earthtone/silent
      tone: "soothing",
      rate: 1.0, // 0.6 - 1.6
      pitch: 1.0, // 0.6 - 1.6
      autoAdapt: true, // optional hook for later
      selectedBrowserVoice: "", // name from speechSynthesis.getVoices()
      sampleText:
        "Hello. This is Sage. I'll speak with clarity and care, at your chosen pace and tone.",
    };
  });

  // Persist immediately on change
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(config));
    } catch {}
  }, [config]);

  // Browser TTS voice list
  const [voices, setVoices] = useState([]);
  const synthRef = useRef(
    typeof window !== "undefined" ? window.speechSynthesis : null
  );
  const utteranceRef = useRef(null);
  const [speaking, setSpeaking] = useState(false);
  const [loadingVoices, setLoadingVoices] = useState(false);

  // Load available voices (if supported)
  useEffect(() => {
    if (!synthRef.current) return;
    const load = () => {
      const v = synthRef.current.getVoices();
      setVoices(v || []);
      setLoadingVoices(false);
    };

    setLoadingVoices(true);
    load();

    // Some browsers (Chromium) load voices async
    if (typeof window !== "undefined") {
      window.speechSynthesis.onvoiceschanged = load;
    }

    return () => {
      if (typeof window !== "undefined") {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Apply preset tweaks based on voiceType + tone
  const derived = useMemo(() => {
    const base = { rate: config.rate, pitch: config.pitch };

    // Soft nudges from voiceType
    if (config.voiceType === "zephyr") {
      base.rate = clamp(base.rate + 0.05, 0.6, 1.6);
      base.pitch = clamp(base.pitch + 0.15, 0.6, 1.6);
    } else if (config.voiceType === "orion") {
      base.rate = clamp(base.rate - 0.05, 0.6, 1.6);
      base.pitch = clamp(base.pitch - 0.05, 0.6, 1.6);
    } else if (config.voiceType === "nova") {
      base.rate = clamp(base.rate + 0.1, 0.6, 1.6);
      base.pitch = clamp(base.pitch + 0.05, 0.6, 1.6);
    } else if (config.voiceType === "earthtone") {
      base.rate = clamp(base.rate - 0.05, 0.6, 1.6);
      base.pitch = clamp(base.pitch - 0.15, 0.6, 1.6);
    } else if (config.voiceType === "silent") {
      // no audio; keep values but preview will be disabled
    }

    // Tone filter nudges
    if (config.tone === "soothing") {
      base.rate = clamp(base.rate - 0.05, 0.6, 1.6);
      base.pitch = clamp(base.pitch - 0.05, 0.6, 1.6);
    } else if (config.tone === "energetic") {
      base.rate = clamp(base.rate + 0.1, 0.6, 1.6);
      base.pitch = clamp(base.pitch + 0.05, 0.6, 1.6);
    } else if (config.tone === "wise") {
      base.rate = clamp(base.rate - 0.03, 0.6, 1.6);
      base.pitch = clamp(base.pitch - 0.08, 0.6, 1.6);
    } else if (config.tone === "curious") {
      base.rate = clamp(base.rate + 0.03, 0.6, 1.6);
      base.pitch = clamp(base.pitch + 0.03, 0.6, 1.6);
    }

    return base;
  }, [config]);

  // Live preview (Speech Synthesis)
  const canSpeak = !!synthRef.current && config.voiceType !== "silent";

  const stopSpeaking = () => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    setSpeaking(false);
  };

  const startPreview = () => {
    if (!canSpeak) return;
    stopSpeaking();

    const u = new SpeechSynthesisUtterance(config.sampleText || "Preview.");
    // apply rate/pitch
    u.rate = Number(derived.rate.toFixed(2));
    u.pitch = Number(derived.pitch.toFixed(2));

    // Try selecting a browser-provided voice if available
    const v =
      voices.find((vo) => vo.name === config.selectedBrowserVoice) ||
      voices.find((vo) => vo.lang?.toLowerCase().startsWith("en")) ||
      voices[0];

    if (v) u.voice = v;

    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);

    utteranceRef.current = u;
    synthRef.current.speak(u);
  };

  const handleApply = () => {
    // Share outward in case TranslateAndListen or others use it
    onApply?.({
      ...config,
      // Provide resolved values too
      resolvedRate: Number(derived.rate.toFixed(2)),
      resolvedPitch: Number(derived.pitch.toFixed(2)),
    });
    toast("Voice settings applied");
  };

  // Little toast
  const toast = (msg) => {
    const d = document.createElement("div");
    d.className =
      "fixed top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-4 py-2 rounded-lg z-[100] shadow-lg";
    d.textContent = msg;
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 1400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { stopSpeaking(); onClose(); }} />
      {/* Panel */}
      <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-gradient-to-r from-purple-600/20 to-pink-600/20">
          <div className="flex items-center gap-3">
            <Waves className="w-5 h-5 text-purple-300" />
            <div>
              <h2 className="text-white font-semibold">Voice Modulator</h2>
              <p className="text-xs text-purple-200/80">
                Shape Sage's speaking voice: type, pacing, pitch and tone.
              </p>
            </div>
          </div>
          <button
            onClick={() => { stopSpeaking(); onClose(); }}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-300"
            aria-label="Close voice modulator"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col md:flex-row">
          {/* Left column */}
          <div className="md:w-[48%] p-6 space-y-5 border-b md:border-b-0 md:border-r border-white/10">
            {/* Voice Type */}
            <section>
              <div className="text-sm text-white mb-2">Voice Type</div>
              <div className="grid grid-cols-2 gap-2">
                {VOICE_TYPES.map((vt) => (
                  <button
                    key={vt.id}
                    onClick={() => setConfig((p) => ({ ...p, voiceType: vt.id }))}
                    className={`text-left px-4 py-3 rounded-xl border transition ${
                      config.voiceType === vt.id
                        ? "border-purple-400/60 bg-purple-500/20 text-white"
                        : "border-white/10 bg-white/5 text-gray-200 hover:bg-white/10"
                    }`}
                  >
                    <div className="text-sm font-medium">{vt.label}</div>
                    <div className="text-xs text-gray-400">{vt.desc}</div>
                  </button>
                ))}
              </div>
              <div className="text-[11px] text-purple-200/70 mt-2">
                "Silent Echo" disables audio output (subtitles only).
              </div>
            </section>

            {/* Tone Filter */}
            <section>
              <div className="text-sm text-white mb-2">Tone Filter</div>
              <div className="flex flex-wrap gap-2">
                {TONES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setConfig((p) => ({ ...p, tone: t.id }))}
                    className={`px-3 py-2 rounded-lg text-xs border transition ${
                      config.tone === t.id
                        ? "border-purple-400/60 bg-purple-500/20 text-white"
                        : "border-white/10 bg-white/5 text-gray-200 hover:bg-white/10"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Auto Adapt Toggle */}
            <section className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
              <div>
                <div className="text-sm text-white">Auto-adapt Echo</div>
                <div className="text-xs text-gray-400">
                  Let Sage gently adjust to your mood over time (local only).
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={!!config.autoAdapt}
                  onChange={() =>
                    setConfig((p) => ({ ...p, autoAdapt: !p.autoAdapt }))
                  }
                />
                <div className="w-10 h-5 bg-gray-600 rounded-full peer peer-checked:bg-purple-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-4 after:w-4 after:rounded-full after:transition-all peer-checked:after:translate-x-5" />
              </label>
            </section>
          </div>

          {/* Right column */}
          <div className="md:w-[52%] p-6 space-y-5">
            {/* Browser Voice (optional) */}
            <section className="bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm text-white">Browser Voice</div>
                  <div className="text-xs text-gray-400">
                    Choose a device voice for preview (if available).
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {loadingVoices && <Loader2 className="w-4 h-4 animate-spin text-purple-300" />}
                  <select
                    value={config.selectedBrowserVoice}
                    onChange={(e) =>
                      setConfig((p) => ({ ...p, selectedBrowserVoice: e.target.value }))
                    }
                    className="bg-white/10 text-white text-sm border border-white/20 rounded-lg px-3 py-2 focus:outline-none"
                  >
                    <option className="bg-gray-900" value="">
                      (Auto)
                    </option>
                    {voices.map((v) => (
                      <option key={v.name + v.lang} value={v.name} className="bg-gray-900">
                        {v.name} {v.lang ? `• ${v.lang}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Rate / Pitch */}
            <section className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-4">
              <SliderRow
                label={`Pacing • ${derived.rate.toFixed(2)}x`}
                min={0.6}
                max={1.6}
                step={0.01}
                value={config.rate}
                onChange={(v) => setConfig((p) => ({ ...p, rate: v }))}
              />
              <SliderRow
                label={`Pitch • ${derived.pitch.toFixed(2)}`}
                min={0.6}
                max={1.6}
                step={0.01}
                value={config.pitch}
                onChange={(v) => setConfig((p) => ({ ...p, pitch: v }))}
              />
            </section>

            {/* Sample Text */}
            <section className="bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-white">Sample Text</div>
                <button
                  onClick={() =>
                    setConfig((p) => ({
                      ...p,
                      sampleText:
                        "Hello. This is Sage. I'll speak with clarity and care, at your chosen pace and tone.",
                    }))
                  }
                  className="text-xs text-gray-300 hover:text-white flex items-center gap-1"
                  title="Reset sample"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reset
                </button>
              </div>
              <textarea
                value={config.sampleText}
                onChange={(e) => setConfig((p) => ({ ...p, sampleText: e.target.value }))}
                rows={3}
                className="w-full bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 px-3 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                placeholder="Type something for Sage to read…"
              />
            </section>

            {/* Preview + Wave */}
            <section className="bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-purple-300" />
                  <div className="text-sm text-white">Live Preview</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={speaking ? stopSpeaking : startPreview}
                    disabled={!canSpeak}
                    className={`px-3 py-2 rounded-lg text-xs border transition flex items-center gap-2 ${
                      canSpeak
                        ? "bg-white/10 hover:bg-white/20 border-white/20 text-white"
                        : "bg-white/5 border-white/10 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {speaking ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {speaking ? "Pause" : "Play"}
                  </button>
                </div>
              </div>

              {/* Soundwave */}
              <div className="mt-4 h-16 flex items-end gap-1 overflow-hidden">
                {new Array(24).fill(0).map((_, i) => (
                  <span
                    key={i}
                    className={`w-[4%] rounded-t-md ${
                      speaking ? "animate-pulse" : ""
                    }`}
                    style={{
                      height: speaking ? `${8 + ((i * 37) % 56)}%` : "14%",
                      background:
                        "linear-gradient(180deg, rgba(168,85,247,0.6) 0%, rgba(236,72,153,0.5) 100%)",
                      opacity: speaking ? 1 : 0.35,
                    }}
                  />
                ))}
              </div>

              {!canSpeak && (
                <div className="mt-3 text-xs text-gray-400">
                  Speech preview isn't available in this browser, or Voice Type is set to "Silent
                  Echo". You can still apply settings for use by your TTS layer.
                </div>
              )}
            </section>

            <div className="flex items-center justify-between">
              <div className="text-[11px] text-purple-200/70">
                Governed by the Wisdom Integration Layer • Local preview only • You own your voice profile
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleApply}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Apply
                </button>
                <button
                  onClick={() => { stopSpeaking(); onClose(); }}
                  className="px-4 py-2 rounded-xl text-sm bg-white/10 hover:bg-white/20 border border-white/20 text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------------- helpers & tiny UI bits ---------------- */

function SliderRow({ label, min, max, step, value, onChange }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-white">{label}</div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-purple-500"
      />
      <div className="text-[11px] text-gray-400 mt-1">
        Drag to fine-tune. Hold <span className="font-mono">Shift</span> for slower movement (OS dependent).
      </div>
    </div>
  );
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default VoiceModulator;
