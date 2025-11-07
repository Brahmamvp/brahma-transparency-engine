// src/components/common/ModuleWrapper.jsx
import React from "react";
import { themes } from "../../styles/themes.js";  // ✅ fixed import

const ModuleWrapper = ({ title, description, children, theme }) => {
  const currentTheme = themes[theme] || themes.dark;

  return (
    <div className={`${currentTheme.glass} rounded-xl p-6 border`}>
      <div className="mb-6">
        <h2
          className={`text-2xl font-bold bg-gradient-to-r ${currentTheme.accent} bg-clip-text text-transparent mb-1`}
        >
          {title}
        </h2>
        <p className={`text-sm ${currentTheme.text.secondary}`}>{description}</p>
      </div>
      {children}
    </div>
  );
};

export default ModuleWrapper;