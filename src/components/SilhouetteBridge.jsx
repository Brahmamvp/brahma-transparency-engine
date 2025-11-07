
import React, { useState } from 'react';

export default function SilhouetteBridge({ 
  isOpen, 
  onClose, 
  currentSession, 
  onExportToContext 
}) {
  const [selectedInsights, setSelectedInsights] = useState(new Set());
  const [journeyNote, setJourneyNote] = useState('');

  if (!isOpen) return null;

  const sessionInsights = [
    {
      id: 1,
      text: "You value both security and growth - not wanting to choose between them",
      source: "conversation_pattern",
      confidence: 0.8
    },
    {
      id: 2, 
      text: "Time flexibility appears more important than speed of results",
      source: "preference_analysis",
      confidence: 0.7
    },
    {
      id: 3,
      text: "You're looking for paths that honor both practical and creative aspects",
      source: "reflection_themes",
      confidence: 0.9
    }
  ];

  const toggleInsight = (id) => {
    const newSelected = new Set(selectedInsights);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedInsights(newSelected);
  };

  const handleExport = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      sessionType: 'transparency_exploration',
      insights: sessionInsights.filter(insight => selectedInsights.has(insight.id)),
      journeyNote: journeyNote,
      nextSteps: "Continue exploring when you feel ready"
    };
    
    onExportToContext(exportData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glassmorphism-strong rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium text-white">Connect to Your Journey</h2>
          <button 
            onClick={onClose}
            className="text-white/60 hover:text-white text-xl transition-colors"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-white/80 text-sm mb-4">
              Select insights from this session that feel meaningful for your broader growth journey:
            </p>
            
            <div className="space-y-3">
              {sessionInsights.map(insight => (
                <label 
                  key={insight.id}
                  className="flex items-start gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedInsights.has(insight.id)}
                    onChange={() => toggleInsight(insight.id)}
                    className="mt-1 rounded text-purple-600"
                  />
                  <div className="flex-1">
                    <p className="text-white/90 text-sm">{insight.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-white/50 text-xs">
                        {insight.source.replace('_', ' ')}
                      </span>
                      <div className="flex">
                        {Array.from({length: Math.round(insight.confidence * 5)}).map((_, i) => (
                          <span key={i} className="text-purple-400 text-xs">★</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-2">
              Add a note about this exploration:
            </label>
            <textarea
              value={journeyNote}
              onChange={e => setJourneyNote(e.target.value)}
              placeholder="What did this session reveal about your decision-making process?"
              className="w-full h-20 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            >
              Skip for now
            </button>
            <button
              onClick={handleExport}
              disabled={selectedInsights.size === 0}
              className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white rounded-full transition-colors disabled:cursor-not-allowed"
            >
              Connect to Journey
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}