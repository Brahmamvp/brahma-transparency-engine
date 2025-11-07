
import React from 'react';
import GlassPanel from './GlassPanel';

export default function ContextTimeline({ contexts }) {
  const getLayerColor = (layer) => {
    const colors = {
      surface: 'bg-blue-500',
      systemic: 'bg-purple-500', 
      legacy: 'bg-pink-500',
      world: 'bg-green-500'
    };
    return colors[layer] || 'bg-gray-500';
  };

  const formatTime = (date) => {
    return date.toLocaleDateString() + ', ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  return (
    <GlassPanel className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white text-lg font-medium">Context Timeline</h3>
        <span className="text-white/60 text-sm">{contexts.length} contexts</span>
      </div>

      {contexts.length === 0 ? (
        <div className="text-center py-8 text-white/60">
          <div className="text-4xl mb-2">📝</div>
          <p>No contexts captured yet</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {contexts.map((context, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
              <div className={`px-2 py-1 ${getLayerColor(context.layer)} text-white text-xs font-medium rounded-full capitalize flex-shrink-0`}>
                {context.layer}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/90 text-sm">{context.text}</p>
                <p className="text-white/60 text-xs mt-1">{formatTime(context.timestamp)}</p>
              </div>
              {context.type === 'voice' && (
                <span className="text-purple-400 text-sm">🎤</span>
              )}
            </div>
          ))}
        </div>
      )}
    </GlassPanel>
  );
}
