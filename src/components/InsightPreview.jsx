import React from 'react';
import GlassPanel from './GlassPanel';

export default function InsightPreview({ contexts, onGenerate }) {
  const hasContexts = contexts.length > 0;

  return (
    <GlassPanel className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white text-lg font-medium">AI Insights</h3>
        <button
          onClick={onGenerate}
          disabled={!hasContexts}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white rounded-full text-sm font-medium transition-colors button-glow disabled:shadow-none"
        >
          Generate
        </button>
      </div>

      {!hasContexts ? (
        <div className="text-center py-8 text-white/60">
          <div className="text-4xl mb-2">🤖</div>
          <p className="italic">Add some context notes to generate insights...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* TODO: Replace with actual AI-generated insights */}
          <div className="p-4 bg-white/5 rounded-lg">
            <h4 className="text-white font-medium text-sm mb-2">Pattern Detected</h4>
            <p className="text-white/80 text-sm">
              Your recent thoughts show a focus on systems thinking and long-term impact...
            </p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <h4 className="text-white font-medium text-sm mb-2">Emotional Theme</h4>
            <p className="text-white/80 text-sm">
              There's an underlying current of optimism mixed with strategic caution...
            </p>
          </div>
        </div>
      )}
    </GlassPanel>
  );
}
