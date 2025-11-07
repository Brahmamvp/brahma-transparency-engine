// src/components/transparency/ThemePanel.jsx
import React from "react";
import { themes } from "../../styles/themes.js";

const ThemePanel = ({ isOpen, onClose, currentTheme, onThemeChange }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-80 bg-white/10 backdrop-blur-xl border-l border-white/20 shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Choose Theme</h3>
            <button onClick={onClose} className="text-white/60 hover:text-white text-xl">
              ✕
            </button>
          </div>
          <div className="space-y-3">
            {Object.entries(themes).map(([key, theme]) => (
              <button
                key={key}
                onClick={() => {
                  onThemeChange(key);
                  onClose();
                }}
                className={`w-full p-4 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 ${
                  currentTheme === key
                    ? "bg-white/20 border-2 border-white/40 shadow-lg"
                    : "bg-white/5 border border-white/20 hover:bg-white/10"
                }`}
              >
                <span className="text-2xl">{theme.icon}</span>
                <span className="text-white font-medium">{theme.name}</span>
                {currentTheme === key && <span className="ml-auto text-emerald-400">✓</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemePanel;
