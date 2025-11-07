// src/components/common/NavButton.jsx
import React from 'react';
import { themes } from '../../styles/themes.js';

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
          : `${currentTheme.text.secondary} hover:${currentTheme.glass.replace("bg-white/10", "bg-white/5")}`
      }`}
      title={label}
    >
      <span className="text-lg group-hover:scale-110 transition-transform duration-300">{icon}</span>
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

export default NavButton;
