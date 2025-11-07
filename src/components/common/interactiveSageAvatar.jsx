// 🧠 FIXED InteractiveSageAvatar.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * InteractiveSageAvatar
 * Props:
 *  - mood: 'peaceful' | 'curious' | 'thoughtful' | 'empathetic' | 'analytical' | 'excited'
 *  - conversationTone: string (optional, cosmetic)
 *  - isThinking: boolean
 *  - isListening: boolean
 *  - size: 'small' | 'medium' | 'large' | 'xl'
 *  - form: 'orb' | 'geometric' | 'silhouette'
 *  - onAvatarClick: () => void
 */
const InteractiveSageAvatar = ({
  mood = "peaceful",
  conversationTone = "neutral",
  isThinking = false,
  isListening = false,
  size = "medium",
  form = "orb",
  onAvatarClick,
}) => {
  const [currentMood, setCurrentMood] = useState(mood);
  const [isAnimating, setIsAnimating] = useState(false);
  const [particles, setParticles] = useState([]);
  const avatarRef = useRef(null);

  // 🎨 Mood colors
  const moodColors = useMemo(
    () => ({
      peaceful: {
        primary: "#A78BFA",
        secondary: "#C4B5FD",
        glow: "rgba(167, 139, 250, 0.65)",
        pulse: "rgba(167, 139, 250, 0.28)",
      },
      curious: {
        primary: "#60A5FA",
        secondary: "#93C5FD",
        glow: "rgba(96, 165, 250, 0.65)",
        pulse: "rgba(96, 165, 250, 0.28)",
      },
      thoughtful: {
        primary: "#34D399",
        secondary: "#6EE7B7",
        glow: "rgba(52, 211, 153, 0.65)",
        pulse: "rgba(52, 211, 153, 0.28)",
      },
      empathetic: {
        primary: "#F472B6",
        secondary: "#FBCFE8",
        glow: "rgba(244, 114, 182, 0.65)",
        pulse: "rgba(244, 114, 182, 0.28)",
      },
      analytical: {
        primary: "#A855F7",
        secondary: "#C084FC",
        glow: "rgba(168, 85, 247, 0.65)",
        pulse: "rgba(168, 85, 247, 0.28)",
      },
      excited: {
        primary: "#F59E0B",
        secondary: "#FDE047",
        glow: "rgba(245, 158, 11, 0.65)",
        pulse: "rgba(245, 158, 11, 0.28)",
      },
    }),
    []
  );

  const colors = moodColors[currentMood] || moodColors.peaceful;

  const sizeClasses = {
    small: "w-16 h-16",
    medium: "w-24 h-24",
    large: "w-32 h-32",
    xl: "w-48 h-48",
  };

  // ✨ Mood animation
  useEffect(() => {
    if (mood !== currentMood) {
      setIsAnimating(true);
      const t = setTimeout(() => {
        setCurrentMood(mood);
        setIsAnimating(false);
      }, 250);
      return () => clearTimeout(t);
    }
  }, [mood, currentMood]);

  // 🧪 Thinking particles
  useEffect(() => {
    if (!isThinking) {
      setParticles([]);
      return;
    }

    const add = setInterval(() => {
      setParticles((prev) => {
        const p = {
          id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
          x: Math.random() * 100,
          y: Math.random() * 100,
          life: 100,
        };
        return [...prev.slice(-7), p];
      });
    }, 220);

    const decay = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({ ...p, life: p.life - 3 }))
          .filter((p) => p.life > 0)
      );
    }, 50);

    return () => {
      clearInterval(add);
      clearInterval(decay);
    };
  }, [isThinking]);

  // 🪶 Forms
  const renderOrb = () => (
    <div className={`${sizeClasses[size]} relative transition-all duration-500`}>
      <div
        className={`absolute inset-0 rounded-full ${
          isListening ? "animate-pulse" : ""
        } ${isAnimating ? "scale-105" : "scale-100"}`}
        style={{
          background: `radial-gradient(circle at 30% 30%, ${colors.secondary}, ${colors.primary})`,
          boxShadow: `0 0 ${size === "xl" ? "60px" : "40px"} ${colors.glow}`,
          filter: isThinking ? "brightness(1.2)" : "brightness(1)",
        }}
      />
      <div
        className="absolute inset-4 rounded-full opacity-60"
        style={{
          background: `radial-gradient(circle at 55% 45%, ${colors.secondary}55, transparent 70%)`,
        }}
      />
      <div
        className="absolute inset-0 rounded-full animate-pulse"
        style={{
          background: `radial-gradient(circle, transparent 58%, ${colors.pulse} 100%)`,
          animationDuration: isThinking ? "1.2s" : "3.2s",
        }}
      />
    </div>
  );

  const renderGeometric = () => (
    <div className={`${sizeClasses[size]} relative transition-all duration-500`}>
      <div
        className={`absolute inset-0 rotate-45 ${
          isListening ? "animate-spin" : ""
        } ${isAnimating ? "scale-105 rotate-[70deg]" : "scale-100 rotate-45"}`}
        style={{
          background: `linear-gradient(135deg, ${colors.secondary}, ${colors.primary})`,
          boxShadow: `0 0 40px ${colors.glow}`,
          animationDuration: "9s",
        }}
      />
      <div
        className="absolute inset-2 rotate-45 opacity-50"
        style={{
          background: `linear-gradient(45deg, transparent 40%, ${colors.secondary} 50%, transparent 60%)`,
        }}
      />
    </div>
  );

  const renderSilhouette = () => (
    <div className={`${sizeClasses[size]} relative transition-all duration-500`}>
      <div
        className={`w-full h-full rounded-full border-4 ${
          isListening ? "animate-pulse" : ""
        } ${isAnimating ? "scale-105" : "scale-100"}`}
        style={{
          borderColor: colors.primary,
          boxShadow: `0 0 40px ${colors.glow}, inset 0 0 40px ${colors.pulse}`,
        }}
      />
      <div
        className="absolute inset-2 rounded-full border-2 opacity-60 animate-spin"
        style={{
          borderColor: `transparent ${colors.secondary} transparent transparent`,
          animationDuration: "6s",
        }}
      />
    </div>
  );

  // 🧩 Renderer selector
  const formRenderer =
    form === "geometric"
      ? renderGeometric
      : form === "silhouette"
      ? renderSilhouette
      : renderOrb;

  return (
    <div className="relative select-none" onClick={onAvatarClick} ref={avatarRef}>
      {/* 🔧 FIXED: Invoke function instead of passing reference */}
      {formRenderer()}

      {/* particles */}
      {isThinking && (
        <div className="absolute inset-0 pointer-events-none">
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                backgroundColor: colors.secondary,
                opacity: p.life / 100,
                transform: `scale(${0.6 + p.life / 160})`,
                boxShadow: `0 0 12px ${colors.glow}`,
                transition: "opacity 150ms linear, transform 150ms linear",
              }}
            />
          ))}
        </div>
      )}

      {/* badges */}
      {isThinking && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
          <div className="bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20">
            <span className="text-xs text-white">thinking…</span>
          </div>
        </div>
      )}
      {isListening && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2">
          <div className="bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20">
            <span className="text-xs text-white flex items-center gap-1">
              <span className="inline-block w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              listening
            </span>
          </div>
        </div>
      )}

      {/* hover tooltip */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity">
        <div className="bg-black/80 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
          {currentMood} • {form} • {conversationTone}
        </div>
      </div>
    </div>
  );
};

export default InteractiveSageAvatar;