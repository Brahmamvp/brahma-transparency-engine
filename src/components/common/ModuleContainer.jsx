// src/components/common/ModuleContainer.jsx
import React from "react";

export default function ModuleContainer({ icon, title, accent = "purple", actions, children }) {
  const accents = {
    purple: "from-purple-600/30 to-pink-600/30",
    blue: "from-blue-600/30 to-cyan-600/30",
    emerald: "from-emerald-600/30 to-green-600/30",
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-xl overflow-hidden">
      <div className={`bg-gradient-to-r ${accents[accent]} p-4 border-b border-white/10 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">{icon}</div>
          <h3 className="font-semibold text-white">{title}</h3>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
