// src/components/memory/WisdomMemory.jsx
import React, { useEffect, useState } from "react";

// Import for visual detection (from previous SVG library)
import { detectNarrativeNeed } from "../../Lib/acf/visualCueDetector.js";
import narratives from "../../assets/narratives/narratives.json";

// NarrativeRenderer (inline or import from ../visuals/NarrativeRenderer.jsx)
const NarrativeRenderer = ({ src, style = "shadow-puppet" }) => {
  return (
    <div
      className={`absolute inset-0 z-10 opacity-80 backdrop-blur-md rounded-lg pointer-events-none transition-all duration-300 ${
        style === "ethereal-calm" ? "mix-blend-overlay saturate-150 shadow-pink-900/30" : "mix-blend-soft-light shadow-purple-900/50"
      }`}
    >
      <img
        src={src}
        alt="Memory Visual Overlay"
        className="w-full h-full object-cover rounded-lg select-none animate-[fade-in_0.5s_ease-in-out]"
      />
    </div>
  );
};

export default function WisdomMemory({ onInsert }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem("brahma_wisdom_mem");
      return raw ? JSON.parse(raw) : seed;
    } catch {
      return seed;
    }
  });
  const [text, setText] = useState("");
  const [showVisualPreview, setShowVisualPreview] = useState(null); // For hover previews

  useEffect(() => {
    try {
      localStorage.setItem("brahma_wisdom_mem", JSON.stringify(items));
    } catch {}
  }, [items]);

  const add = () => {
    if (!text.trim()) return;
    
    // Auto-detect visual suggestion
    const narrativeCheck = detectNarrativeNeed(text, { emotion: "neutral" });
    const topicKey = narrativeCheck.topic?.toLowerCase() || "default";
    const suggestedVisual = narrativeCheck.needsNarrative ? narratives[topicKey] || narratives["default"] : null;
    
    const entry = {
      id: Date.now(),
      text: text.trim(),
      ts: new Date().toISOString(),
      tag: "note",
      visual: suggestedVisual ? {
        type: "cloudVideo",
        src: suggestedVisual.src,
        style: suggestedVisual.style,
        suggested: true // Flag for user confirmation if needed
      } : null,
    };
    setItems((p) => [entry, ...p].slice(0, 100));
    setText("");
    toast("Memory saved with visual suggestion"); // Use your toast util
  };

  const remove = (id) => setItems((p) => p.filter((i) => i.id !== id));

  const handleHover = (entry, hovered) => {
    setShowVisualPreview(hovered ? entry : null);
  };

  const insertWithVisual = (entry) => {
    if (onInsert) {
      onInsert({
        ...entry,
        visual: entry.visual // Pass visual meta for Sage to render
      });
    }
    toast("Inserted memory with visual"); // Optional feedback
  };

  return (
    <div className="space-y-6">
      {/* Input with Visual Suggestion */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex gap-2 relative">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a memory… (e.g., 'Overcoming doubt')"
          className="flex-1 bg-transparent text-white/90 outline-none"
          onFocus={() => {
            // Real-time suggestion on type (debounced if needed)
            const check = detectNarrativeNeed(text);
            if (check.needsNarrative) {
              toast(`Suggested visual: ${narratives[check.topic?.toLowerCase() || 'default'].description}`);
            }
          }}
        />
        <button
          onClick={add}
          className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          Save
        </button>
        {/* Visual Suggestion Preview (small thumbnail) */}
        {detectNarrativeNeed(text).needsNarrative && (
          <div className="absolute bottom-[-40px] right-0 w-12 h-12 rounded bg-white/10 border border-white/20">
            <NarrativeRenderer src={narratives.default.src} style="ethereal-calm" />
          </div>
        )}
      </div>

      {/* List with Visual Overlays */}
      <div className="space-y-3 max-h-[55vh] overflow-auto">
        {items.map((m) => (
          <div
            key={m.id}
            className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-start justify-between relative group"
            onMouseEnter={() => handleHover(m, true)}
            onMouseLeave={() => handleHover(m, false)}
          >
            {/* Visual Overlay on Hover */}
            {m.visual && showVisualPreview?.id === m.id && (
              <NarrativeRenderer
                src={m.visual.src}
                style={m.visual.style}
              />
            )}
            
            <div className={`pr-3 flex-1 ${m.visual ? 'opacity-90' : 'opacity-100'}`}>
              <div className="text-xs text-white/60">
                {new Date(m.ts).toLocaleString()} {m.tag && `· ${m.tag}`}
                {m.visual && (
                  <span className="ml-2 px-1 py-0.5 bg-purple-600/30 text-purple-200 text-[10px] rounded">
                    {m.visual.suggested ? 'Suggested' : 'Visual'}
                  </span>
                )}
              </div>
              <div className="text-white/90 text-sm mt-1 whitespace-pre-wrap relative z-10">
                {m.text}
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              {onInsert && (
                <button
                  onClick={() => insertWithVisual(m)}
                  className="text-xs px-2 py-1 rounded bg-white/10 border border-white/20 text-white/80 hover:bg-white/20"
                  title="Insert into chat with visual"
                >
                  Insert
                </button>
              )}
              <button
                onClick={() => remove(m.id)}
                className="text-xs px-2 py-1 rounded bg-red-500/20 border border-red-400/30 text-red-200 hover:bg-red-500/30"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center text-white/60 py-8 relative">
            No memories yet. Add one to see visual suggestions in action.
            {/* Default animation teaser */}
            <NarrativeRenderer src={narratives.default.src} style="ethereal-calm" />
          </div>
        )}
      </div>
    </div>
  );
}

// Enhanced seed with visuals
const seed = [
  {
    id: 1,
    text: "True north: autonomy + craft. Prefer paths that protect deep work.",
    ts: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    tag: "value",
    visual: {
      type: "cloudVideo",
      src: "/src/assets/narratives/growth.svg",
      style: "shadow-puppet",
      suggested: true
    }
  },
  {
    id: 2,
    text: "When risk feels high, extend horizon by 3–6 months before judging outcome.",
    ts: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    tag: "heuristic",
    visual: {
      type: "cloudVideo",
      src: "/src/assets/narratives/doubt.svg",
      style: "ethereal-calm",
      suggested: true
    }
  },
];

// Optional toast util (if not global)
function toast(text) {
  // Your existing toast implementation
  console.log(text); // Fallback
}
