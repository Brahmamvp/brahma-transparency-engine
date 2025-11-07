import React from 'react';
import GlassPanel from './GlassPanel';

export default function ContextStats({ stats }) {
  const statItems = [
    { label: 'Total Notes', value: stats.totalNotes, color: 'text-cyan-400' },
    { label: 'Selected', value: stats.selected, color: 'text-purple-400' },
    { label: 'AI Insights', value: stats.aiInsights, color: 'text-green-400' },
    { label: 'Active Layers', value: stats.activeLayers, color: 'text-yellow-400' }
  ];

  return (
    <GlassPanel className="p-6 mb-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {statItems.map((stat, index) => (
          <div key={index} className="text-center">
            <div className={`text-3xl lg:text-4xl font-bold ${stat.color} glow-text`}>
              {stat.value}
            </div>
            <div className="text-white/80 text-sm mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
