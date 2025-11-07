// src/components/ActiveContextStrip.jsx
import React from "react";
// ✅ FIXED: Changed import path to .jsx
import { useCognitiveField } from "../store/cognitiveField.jsx"; 

export default function ActiveContextStrip() {
  const { state } = useCognitiveField();
  
  // A tiny map for better mood icons/colors
  const toneMap = {
    reflective: { icon: "🧠", color: "text-blue-300" },
    anxious: { icon: "😬", color: "text-yellow-300" },
    peaceful: { icon: "🧘", color: "text-green-300" },
    curious: { icon: "🤔", color: "text-purple-300" },
    default: { icon: "—", color: "text-gray-400" }
  };
  const toneData = toneMap[state.emotionalTone] || toneMap.default;

  return (
    <div className="flex items-center gap-3 text-xs rounded-full px-4 py-2 bg-white/5 border border-white/10 shadow-lg select-none">
      
      {/* Layer */}
      <div className="flex items-center gap-1">
        <span className="opacity-80">🟣 Lens:</span>
        <span className="font-semibold capitalize text-purple-300">{state.currentLayer}</span>
      </div>
      
      <span className="opacity-30">|</span>
      
      {/* Time */}
      <div className="flex items-center gap-1">
        <span className="opacity-80">🕓</span>
        <span className="font-medium capitalize text-gray-200">{state.timeOfDay}</span>
      </div>
      
      <span className="opacity-30">|</span>
      
      {/* Tone */}
      <div className="flex items-center gap-1">
        <span className={`font-medium ${toneData.color}`}>{toneData.icon}</span>
        <span className={`font-medium capitalize ${toneData.color}`}>{state.emotionalTone || "Neutral"}</span>
      </div>
      
      <span className="opacity-30">|</span>
      
      {/* Mode */}
      <div className="flex items-center gap-1">
        <span className="opacity-80">🧩 Mode:</span>
        <span className="font-medium capitalize text-emerald-300">{state.activeMode}</span>
      </div>
    </div>
  );
}
