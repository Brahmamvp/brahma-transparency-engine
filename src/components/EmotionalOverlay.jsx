
import React, { useState, useEffect } from 'react';

export default function EmotionalOverlay({ lastMessage, onSuggestPrompt }) {
  const [suggestion, setSuggestion] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const emotionalPatterns = {
    stuck: {
      keywords: ['stuck', 'confused', 'don\'t know', 'unsure'],
      suggestions: [
        {
          message: "Feeling stuck is natural when exploring important decisions.",
          prompt: "What's the cost of not deciding right now?"
        },
        {
          message: "Sometimes the middle path reveals itself when we stop forcing.",
          prompt: "What would happen if you waited a bit longer?"
        }
      ]
    },
    heavy: {
      keywords: ['heavy', 'overwhelming', 'too much', 'pressure'],
      suggestions: [
        {
          message: "This feels like a lot to carry.",
          prompt: "What support do you have as you work through this?"
        },
        {
          message: "Big decisions can feel weighty.",
          prompt: "What would make this feel more manageable?"
        }
      ]
    },
    fear: {
      keywords: ['scared', 'afraid', 'terrified', 'worried'],
      suggestions: [
        {
          message: "Fear often points toward what matters most to us.",
          prompt: "What are you afraid of losing?"
        },
        {
          message: "Your concerns make complete sense.",
          prompt: "What would you need to feel more confident?"
        }
      ]
    },
    excitement: {
      keywords: ['excited', 'thrilled', 'can\'t wait', 'amazing'],
      suggestions: [
        {
          message: "That energy is beautiful - what's fueling it?",
          prompt: "What specifically feels most compelling about this?"
        }
      ]
    }
  };

  useEffect(() => {
    if (!lastMessage || lastMessage.role !== 'user') return;

    const text = lastMessage.text.toLowerCase();
    let matchedPattern = null;

    for (const [emotion, pattern] of Object.entries(emotionalPatterns)) {
      if (pattern.keywords.some(keyword => text.includes(keyword))) {
        matchedPattern = {
          emotion,
          suggestion: pattern.suggestions[Math.floor(Math.random() * pattern.suggestions.length)]
        };
        break;
      }
    }

    if (matchedPattern) {
      setSuggestion(matchedPattern);
      setIsVisible(true);
      
      // Auto-hide after 10 seconds
      setTimeout(() => setIsVisible(false), 10000);
    }
  }, [lastMessage]);

  const handleUseSuggestion = () => {
    if (suggestion) {
      onSuggestPrompt(suggestion.suggestion.prompt);
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!suggestion || !isVisible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 lg:left-6 lg:right-auto lg:max-w-sm z-40">
      <div className="glassmorphism p-4 rounded-xl border border-purple-300/30 slide-up">
        <div className="flex items-start gap-3">
          <div className="text-lg">💙</div>
          <div className="flex-1">
            <p className="text-white/90 text-sm font-light mb-2">
              {suggestion.suggestion.message}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleUseSuggestion}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-full transition-colors"
              >
                Explore this
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white/70 text-xs rounded-full transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
