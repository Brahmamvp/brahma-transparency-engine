import React, { useState } from "react";

/**
 * Enhanced animated avatar with mesmerizing pulse glow effects.
 */
export default function SageAvatar({
  form = "orb",
  emotion = "calm",
  size = "md",
}) {
  const sizeClasses = {
    small: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-20 h-20",
    xl: "w-32 h-32",
  };

  const sz = sizeClasses[size] || sizeClasses.md;

  const emotionConfig = {
    calm: {
      gradient: "from-indigo-400 via-purple-400 to-blue-500",
      glow: "shadow-[0_0_30px_rgba(99,102,241,0.6)]",
      pulseColor: "rgba(99,102,241,0.8)",
      animate: "animate-pulse-gentle",
    },
    thinking: {
      gradient: "from-blue-400 via-cyan-400 to-teal-500",
      glow: "shadow-[0_0_35px_rgba(56,189,248,0.7)]",
      pulseColor: "rgba(56,189,248,0.8)",
      animate: "animate-pulse-thinking",
    },
    excited: {
      gradient: "from-pink-400 via-rose-400 to-purple-500",
      glow: "shadow-[0_0_40px_rgba(236,72,153,0.8)]",
      pulseColor: "rgba(236,72,153,0.9)",
      animate: "animate-pulse-excited",
    },
    focused: {
      gradient: "from-emerald-400 via-teal-400 to-green-500",
      glow: "shadow-[0_0_32px_rgba(52,211,153,0.7)]",
      pulseColor: "rgba(52,211,153,0.8)",
      animate: "animate-pulse-focused",
    },
    peaceful: {
      gradient: "from-violet-400 via-purple-400 to-indigo-500",
      glow: "shadow-[0_0_45px_rgba(167,139,250,0.8)]",
      pulseColor: "rgba(167,139,250,0.9)",
      animate: "animate-pulse-peaceful",
    },
    curious: {
      gradient: "from-amber-400 via-orange-400 to-red-500",
      glow: "shadow-[0_0_38px_rgba(251,191,36,0.7)]",
      pulseColor: "rgba(251,191,36,0.8)",
      animate: "animate-pulse-curious",
    },
  };

  const config = emotionConfig[emotion] || emotionConfig.calm;

  const shapeClasses = {
    geo: "rounded-lg rotate-45",
    silhouette: "rounded-[40%] border-2 border-white/30 bg-transparent",
    orb: "rounded-full",
  };

  const shape = shapeClasses[form] || shapeClasses.orb;

  return (
    <div className="sage-avatar-container relative inline-block">
      {/* Outer pulse rings */}
      <div className="absolute inset-0 -m-4">
        <div
          className={`absolute inset-0 rounded-full ${config.animate} opacity-40`}
          style={{
            background: `radial-gradient(circle, ${config.pulseColor} 0%, transparent 70%)`,
            filter: "blur(8px)",
          }}
        />
        <div
          className={`absolute inset-2 rounded-full ${config.animate} opacity-30`}
          style={{
            background: `radial-gradient(circle, ${config.pulseColor} 0%, transparent 60%)`,
            filter: "blur(12px)",
            animationDelay: "0.5s",
          }}
        />
      </div>

      {/* Main avatar */}
      <div
        className={`sage-avatar ${sz} bg-gradient-to-br ${config.gradient} ${shape} ${config.glow} relative overflow-hidden transition-all duration-500 hover:scale-110 backdrop-blur-sm`}
        title={`Sage • ${emotion}`}
      >
        {/* Excited sparkles */}
        {emotion === "excited" && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1 left-2 w-1 h-1 bg-white rounded-full animate-ping opacity-75" />
            <div
              className="absolute bottom-2 right-1 w-1 h-1 bg-white rounded-full animate-ping opacity-60"
              style={{ animationDelay: "0.5s" }}
            />
            <div
              className="absolute top-2 right-2 w-0.5 h-0.5 bg-white rounded-full animate-ping opacity-80"
              style={{ animationDelay: "1s" }}
            />
          </div>
        )}

        {/* Thinking dots */}
        {emotion === "thinking" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-white rounded-full animate-bounce opacity-80" />
              <div
                className="w-1 h-1 bg-white rounded-full animate-bounce opacity-80"
                style={{ animationDelay: "0.1s" }}
              />
              <div
                className="w-1 h-1 bg-white rounded-full animate-bounce opacity-80"
                style={{ animationDelay: "0.2s" }}
              />
            </div>
          </div>
        )}

        {/* Peaceful ripple */}
        {emotion === "peaceful" && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-2 rounded-full border border-white/20 animate-ping opacity-40" />
            <div
              className="absolute inset-4 rounded-full border border-white/15 animate-ping opacity-30"
              style={{ animationDelay: "1s" }}
            />
          </div>
        )}
      </div>

      {/* Glow backdrop */}
      <div
        className="absolute inset-0 -z-10 rounded-full opacity-50 animate-pulse-glow"
        style={{
          background: `radial-gradient(circle, ${config.pulseColor} 0%, transparent 80%)`,
          filter: "blur(20px)",
          transform: "scale(1.5)",
        }}
      />

      {/* Animations */}
      <style>{`
        @keyframes pulse-gentle { 0%,100%{opacity:.4;transform:scale(.95);}50%{opacity:.7;transform:scale(1.05);} }
        @keyframes pulse-thinking { 0%,100%{opacity:.3;transform:scale(.9);}50%{opacity:.8;transform:scale(1.1);} }
        @keyframes pulse-excited { 0%,100%{opacity:.5;transform:scale(.9);}25%{opacity:.9;transform:scale(1.15);}75%{opacity:.7;transform:scale(1.05);} }
        @keyframes pulse-focused { 0%,100%{opacity:.4;transform:scale(1);}50%{opacity:.8;transform:scale(1.08);} }
        @keyframes pulse-peaceful { 0%,100%{opacity:.3;transform:scale(.95);}50%{opacity:.6;transform:scale(1.02);} }
        @keyframes pulse-curious { 0%,100%{opacity:.4;transform:scale(.98);}33%{opacity:.8;transform:scale(1.12);}66%{opacity:.6;transform:scale(1.04);} }
        @keyframes pulse-glow { 0%,100%{opacity:.3;transform:scale(1.2);}50%{opacity:.6;transform:scale(1.6);} }
        .animate-pulse-gentle{animation:pulse-gentle 3s ease-in-out infinite;}
        .animate-pulse-thinking{animation:pulse-thinking 2s ease-in-out infinite;}
        .animate-pulse-excited{animation:pulse-excited 1.5s ease-in-out infinite;}
        .animate-pulse-focused{animation:pulse-focused 2.5s ease-in-out infinite;}
        .animate-pulse-peaceful{animation:pulse-peaceful 4s ease-in-out infinite;}
        .animate-pulse-curious{animation:pulse-curious 1.8s ease-in-out infinite;}
        .animate-pulse-glow{animation:pulse-glow 3s ease-in-out infinite;}
      `}</style>
    </div>
  );
}

/* === Interactive Showcase Demo === */
export function SageAvatarDemo() {
  const [form, setForm] = useState("orb");
  const [emotion, setEmotion] = useState("calm");
  const [size, setSize] = useState("lg");

  const emotions = ["calm", "thinking", "excited", "focused", "peaceful", "curious"];
  const forms = ["orb", "geo", "silhouette"];
  const sizes = ["small", "md", "lg", "xl"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-8 text-white">
      <div className="max-w-4xl mx-auto space-y-12">
        <h1 className="text-4xl font-bold text-center">SageAvatar Lab</h1>

        {/* Avatar Preview */}
        <div className="flex justify-center">
          <SageAvatar form={form} emotion={emotion} size={size} />
        </div>

        {/* Controls */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Form</label>
            <select
              value={form}
              onChange={(e) => setForm(e.target.value)}
              className="w-full bg-black/40 border border-white/20 rounded-lg p-2"
            >
              {forms.map((f) => (
                <option key={f} value={f} className="bg-gray-900">
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Emotion</label>
            <select
              value={emotion}
              onChange={(e) => setEmotion(e.target.value)}
              className="w-full bg-black/40 border border-white/20 rounded-lg p-2"
            >
              {emotions.map((emo) => (
                <option key={emo} value={emo} className="bg-gray-900">
                  {emo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Size</label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full bg-black/40 border border-white/20 rounded-lg p-2"
            >
              {sizes.map((s) => (
                <option key={s} value={s} className="bg-gray-900">
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}