// src/components/transparency/MemoryWisdom.jsx
import React from "react";

const MemoryWisdom = ({ userData }) => {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <h2 className="text-xl font-semibold text-white mb-3">🧩 Memory Wisdom</h2>
      <p className="text-purple-200 text-sm mb-4">
        Sage remembers your past reflections and decisions here. 
        Over time, this space will grow into your personal wisdom archive.
      </p>

      <div className="space-y-3">
        <div className="p-3 rounded-lg bg-purple-900/30 border border-purple-700/30">
          <p className="text-sm text-purple-100">
            🌱 Example: You valued <strong>stability</strong> in a career 
            choice two weeks ago.
          </p>
        </div>
        <div className="p-3 rounded-lg bg-purple-900/30 border border-purple-700/30">
          <p className="text-sm text-purple-100">
            🔮 Example: You leaned toward <strong>growth</strong> when exploring 
            an education path.
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-6">
        Future versions will include timelines, memory modes (Transient, Active, 
        Archive, Locked), and searchable insights.
      </p>
    </div>
  );
};

export default MemoryWisdom;