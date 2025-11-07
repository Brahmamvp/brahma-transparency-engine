
import React, { useState } from 'react';

export default function PromptSuggestion({ onSelectPrompt, visible = true }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const promptCategories = {
    getting_started: [
      "I'm trying to decide between...",
      "I feel stuck about...", 
      "Help me think through...",
      "What should I consider about..."
    ],
    when_stuck: [
      "What's the real tension here?",
      "What am I afraid of losing?",
      "What would success look like?",
      "What's my gut telling me?"
    ],
    exploration: [
      "Can't choose? Let's explore both.",
      "What matters most to me in this?",
      "How do these options align with my values?",
      "What support do I need for this decision?"
    ]
  };

  const [currentCategory, setCurrentCategory] = useState('getting_started');

  if (!visible) return null;

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-purple-300 hover:text-white text-sm transition-colors flex items-center gap-2"
      >
        💡 Need a starting point?
        <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ↓
        </span>
      </button>

      {isExpanded && (
        <div className="mt-3 p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex gap-2 mb-3">
            {Object.keys(promptCategories).map(category => (
              <button
                key={category}
                onClick={() => setCurrentCategory(category)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  currentCategory === category
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {category.replace('_', ' ')}
              </button>
            ))}
          </div>
          
          <div className="space-y-2">
            {promptCategories[currentCategory].map((prompt, index) => (
              <button
                key={index}
                onClick={() => {
                  onSelectPrompt(prompt);
                  setIsExpanded(false);
                }}
                className="block w-full text-left p-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
