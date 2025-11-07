// src/components/transparency/EchoSettings.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  X,
  SlidersHorizontal,
  Sparkles,
  Download,
  Upload,
  RefreshCw,
  Stars,
  LayoutGrid,
} from "lucide-react";

/**
 * EchoSettings
 * Persona-style tuning for Sage's communication vibe.
 *
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - onApply?: (settings) => void   // emits the saved settings
 *
 * Storage key: 'brahma_echo_settings'
 */
const EchoSettings = ({ isOpen, onClose, onApply }) => {
  const LS_KEY = "brahma_echo_settings";

  // Sliders live in [-100..+100] for easier preset math; UI displays left/right labels.
  const [cfg, setCfg] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(LS_KEY) || "null");
      if (raw && typeof raw === "object") return raw;
    } catch {}
    return {
      seriousPlayful: 0, // -100 = Serious, +100 = Playful
      softBold: -20, // -100 = Soft-spoken, +100 = Bold
      abstractPractical: 0, // -100 = Abstract, +100 = Practical
      passiveDirective: -10, // -100 = Passive, +100 = Directive
      autoAdapt: true,
      note: "Echo v1",
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(cfg));
    } catch {}
  }, [cfg]);

  // Derived "tone" badges (purely cosmetic)
  const badges = useMemo(() => {
    const b = [];
    if (cfg.seriousPlayful > 35) b.push("Playful");
    else if (cfg.seriousPlayful < -35) b.push("Serious");

    if (cfg.softBold > 35) b.push("Bold");
    else if (cfg.softBold < -35) b.push("Soft-spoken");

    if (cfg.abstractPractical > 35) b.push("Practical");
    else if (cfg.abstractPractical < -35) b.push("Abstract");

    if (cfg.passiveDirective > 35) b.push("Directive");
    else if (cfg.passiveDirective < -35) b.push("Passive");

    return b;
  }, [cfg]);

  // Presets (you can tweak these at will)
  const PRESETS = [
    {
      id: "quiet",
      label: "Quiet Companion",
      desc: "Gentle, reflective, spacious",
      values: {
        seriousPlayful: -15,
        softBold: -60,
        abstractPractical: -10,
        passiveDirective: -55,
      },
    },
    {
      id: "strategist",
      label: "Trusted Strategist",
      desc: "Clear, steady, outcome-oriented",
      values: {
        seriousPlayful: -10,
        softBold: 35,
        abstractPractical: 40,
        passiveDirective: 25,
      },
    },
    {
      id: "curious",
      label: "Curious Guide",
      desc: "Warm, inquisitive, lightly playful",
      values: {
        seriousPlayful: 35,
        softBold: -5,
        abstractPractical: -5,
        passiveDirective: -10,
      },
    },
    {
      id: "cosmic",
      label: "Cosmic Mirror",
      desc: "Spacious, symbolic, contemplative",
      values: {
        seriousPlayful: 15,
        softBold: -20,
        abstractPractical: -55,
        passiveDirective: -35,
      },
    },
  ];

  const applyPreset = (p) => setCfg((prev) => ({ ...prev, ...p.values }));

  const handleReset = () =>
    setCfg({
      seriousPlayful: 0,
      softBold: -20,
      abstractPractical: 0,
      passiveDirective: -10,
      autoAdapt: true,
      note: "Echo v1",
    });

  const handleExport = () => {
    const bundle = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      settings: cfg,
    };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `brahma-echo-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    try {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "application/json";
      input.onchange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const text = await file.text();
        const data = JSON.parse(text);
        const next = data?.settings || data; // accept both bundle or raw
        // minimal sanity check
        if (
          typeof next?.seriousPlayful === "number" &&
          typeof next?.softBold === "number" &&
          typeof next?.abstractPractical === "number" &&
          typeof next?.passiveDirective === "number"
        ) {
          setCfg(next);
          toast("Echo settings imported");
        } else {
          toast("Import failed: invalid file");
        }
      };
      input.click();
    } catch {
      toast("Import failed");
    }
  };

  const handleApply = () => {
    onApply?.(cfg);
    toast("Echo settings applied");
  };

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
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-gradient-to-r from-purple-600/20 to-pink-600/20">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-5 h-5 text-purple-300" />
            <div>
              <h2 className="text-white font-semibold">Echo Settings</h2>
              <p className="text-xs text-purple-200/80">
                Tune Sage's communication personality to match your vibe.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-300"
            aria-label="Close echo settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 lg:grid-cols-5">
          {/* Left: Presets */}
          <div className="lg:col-span-2 p-6 border-b lg:border-b-0 lg:border-r border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <LayoutGrid className="w-4 h-4 text-purple-300" />
              <div className="text-sm text-white">Presets</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p)}
                  className="text-left px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition group"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-white">
                      {p.label}
                    </div>
                    <Stars className="w-4 h-4 text-purple-300 opacity-70 group-hover:opacity-100" />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{p.desc}</div>
                </button>
              ))}
            </div>

            {/* Derived badges */}
            <div className="mt-5">
              <div className="text-sm text-white mb-2">Current Blend</div>
              <div className="flex flex-wrap gap-2">
                {badges.length ? (
                  badges.map((b) => (
                    <span
                      key={b}
                      className="text-xs px-2 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-100"
                    >
                      {b}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-400">
                    Balanced / Neutral
                  </span>
                )}
              </div>
            </div>

            {/* Export / Import / Reset */}
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                onClick={handleExport}
                className="px-3 py-2 rounded-lg text-xs bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
              <button
                onClick={handleImport}
                className="px-3 py-2 rounded-lg text-xs bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center gap-2"
              >
                <Upload className="w-3.5 h-3.5" />
                Import
              </button>
              <button
                onClick={handleReset}
                className="px-3 py-2 rounded-lg text-xs bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>

            <div className="text-[11px] text-purple-200/70 mt-3">
              Governed by the Wisdom Integration Layer • RL signals logged
              locally • You own your evolution
            </div>
          </div>

          {/* Right: Sliders */}
          <div className="lg:col-span-3 p-6 space-y-5 overflow-y-auto max-h-[70vh]">
            <SliderBlock
              title="Serious ↔ Playful"
              value={cfg.seriousPlayful}
              onChange={(v) => setCfg((p) => ({ ...p, seriousPlayful: v }))}
              leftLabel="Serious"
              rightLabel="Playful"
              hint="Affects humor, levity, and lightness in phrasing."
            />
            <SliderBlock
              title="Soft-Spoken ↔ Bold"
              value={cfg.softBold}
              onChange={(v) => setCfg((p) => ({ ...p, softBold: v }))}
              leftLabel="Soft-Spoken"
              rightLabel="Bold"
              hint="Controls confidence, emphasis, and strength of suggestions."
            />
            <SliderBlock
              title="Abstract ↔ Practical"
              value={cfg.abstractPractical}
              onChange={(v) =>
                setCfg((p) => ({ ...p, abstractPractical: v }))
              }
              leftLabel="Abstract"
              rightLabel="Practical"
              hint="Balances metaphorical / conceptual language vs actionable detail."
            />
            <SliderBlock
              title="Passive ↔ Directive"
              value={cfg.passiveDirective}
              onChange={(v) =>
                setCfg((p) => ({ ...p, passiveDirective: v }))
              }
              leftLabel="Passive"
              rightLabel="Directive"
              hint="Shifts from reflective prompts to clearer guidance."
            />

            {/* Auto Adapt */}
            <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
              <div>
                <div className="text-sm text-white">Auto-adapt Echo</div>
                <div className="text-xs text-gray-400">
                  Let Sage gently adjust style to your mood over time (local-only).
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={!!cfg.autoAdapt}
                  onChange={() =>
                    setCfg((p) => ({ ...p, autoAdapt: !p.autoAdapt }))
                  }
                />
                <div className="w-10 h-5 bg-gray-600 rounded-full peer peer-checked:bg-purple-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-4 after:w-4 after:rounded-full after:transition-all peer-checked:after:translate-x-5" />
              </label>
            </div>

            {/* Footer buttons */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-[11px] text-purple-200/70">
                Echo affects phrasing, tone, and suggestion style — not your data.
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
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-sm bg-white/10 hover:bg-white/20 border border-white/20 text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* End Body */}
      </div>
    </div>
  );
};

/* ---------------- Small subcomponents ---------------- */

function SliderBlock({
  title,
  value,
  onChange,
  leftLabel,
  rightLabel,
  hint,
}) {
  return (
    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-white">{title}</div>
        <div className="text-xs text-gray-400 font-mono">
          {value > 0 ? `+${value}` : value}
        </div>
      </div>
      <div className="flex items-center justify-between text-[11px] text-gray-400 mb-2">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      <input
        type="range"
        min={-100}
        max={100}
        step={1}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full accent-purple-500"
      />
      {hint && <div className="text-[11px] text-gray-400 mt-2">{hint}</div>}
    </div>
  );
}

export default EchoSettings;
