import React, { useState } from 'react';
import SageChat from './SageChat.jsx';

const ReflectionSandbox = ({ option, onClose, onReturnToMain, mainConversations }) => {
  const [sandboxConversations, setSandboxConversations] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [explorationFocus, setExplorationFocus] = useState('');

  const focusOptions = [
    { id: 'worst-case', label: 'Worst Case Scenarios', emoji: '⚠️', description: 'What if everything goes wrong?' },
    { id: 'best-case', label: 'Best Case Outcomes', emoji: '✨', description: 'What if everything aligns perfectly?' },
    { id: 'timeline', label: 'Timeline Deep Dive', emoji: '📅', description: 'How does timing affect this path?' },
    { id: 'resources', label: 'Resource Requirements', emoji: '🛠️', description: 'What will this really take?' },
    { id: 'relationships', label: 'Impact on Relationships', emoji: '👥', description: 'How does this affect others?' },
    { id: 'values', label: 'Values Alignment', emoji: '💎', description: 'Does this honor who I am?' }
  ];

  const handleSendMessage = (message) => {
    const newConversation = { user: message, sage: '' };
    setSandboxConversations(prev => [...prev, newConversation]);
    setIsTyping(true);

    setTimeout(() => {
      const contextualResponses = {
        'worst-case': [
          "Let's explore that fear together. What specifically worries you most about this path?",
          "I notice some anxiety around this. What would need to be true for you to feel safer here?",
          "What if the worst case happened - how might you respond or recover?",
          "Fear often carries wisdom. What is this worry trying to protect in you?"
        ],
        'best-case': [
          "That sounds exciting. What would success really look like for you?",
          "I can feel the hope in that vision. What draws you most to this possibility?",
          "If everything went perfectly, how would you know you'd made the right choice?",
          "What parts of this best case feel most alive and true to you?"
        ],
        'timeline': [
          "Time has its own wisdom. What feels urgent versus what can wait?",
          "I'm curious about the pacing that feels right for you in this.",
          "How does this timeline honor both your needs and your constraints?",
          "What would happen if you moved faster? Slower? What does your intuition say?"
        ],
        'resources': [
          "What support would make this feel more possible?",
          "I notice resource concerns. What would you need to feel truly prepared?",
          "Sometimes the resources we think we need aren't the ones that matter most. What feels essential?",
          "What resources do you already have that you might be overlooking?"
        ],
        'relationships': [
          "Who else is affected by this choice? How does that sit with you?",
          "I hear the relational dimension. What conversations might need to happen?",
          "How does this path honor your relationships while staying true to yourself?",
          "What would the people who love you say about this choice?"
        ],
        'values': [
          "That touches something deep. What values are you trying to honor here?",
          "I can sense the importance of this alignment. What feels most true to who you are?",
          "Sometimes our values point us toward paths that feel risky but right. What's your intuition saying?",
          "What would you choose if you knew you couldn't fail? What does that tell you about your values?"
        ]
      };

      const responses = contextualResponses[explorationFocus] || [
        "I'm here to explore this with you. What aspect feels most important right now?",
        "This path has many dimensions. What would help you feel more clarity?",
        "What questions are stirring for you as we dive deeper into this?"
      ];

      const response = responses[Math.floor(Math.random() * responses.length)];

      setSandboxConversations(prev => {
        const updated = [...prev];
        updated[updated.length - 1].sage = response;
        return updated;
      });
      setIsTyping(false);
    }, 1500);
  };

  const handleReturnWithInsights = () => {
    const insights = sandboxConversations.map(conv => ({
      question: conv.user,
      reflection: conv.sage,
      focus: explorationFocus,
      timestamp: new Date().toISOString()
    }));

    onReturnToMain({
      option,
      insights,
      explorationSummary: `Explored ${option.title} through ${focusOptions.find(f => f.id === explorationFocus)?.label} lens`,
      focusArea: explorationFocus
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden border border-white/20 shadow-2xl">
        <div className="flex h-full max-h-[90vh]">
          {/* Left Panel: Sandbox Controls */}
          <div className="w-1/3 bg-blue-500/10 border-r border-white/10 p-6 overflow-y-auto">
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-3xl mb-3">🔬</div>
                <h3 className="text-xl font-semibold text-white mb-2">Reflection Sandbox</h3>
                <p className="text-sm text-blue-200 mb-1">Private exploration space</p>
                <p className="text-xs text-gray-400">Exploring: "{option.title}"</p>
              </div>

              <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                <h4 className="text-sm font-medium text-white mb-3">Choose Your Exploration Lens</h4>
                <div className="space-y-2">
                  {focusOptions.map(focus => (
                    <button
                      key={focus.id}
                      onClick={() => setExplorationFocus(focus.id)}
                      className={`w-full text-left p-3 rounded-lg text-sm transition-all group ${
                        explorationFocus === focus.id
                          ? 'bg-blue-500/30 text-white border border-blue-400'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-lg">{focus.emoji}</span>
                        <span className="font-medium">{focus.label}</span>
                      </div>
                      <p className="text-xs text-gray-400 group-hover:text-gray-300 ml-8">
                        {focus.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-purple-500/20 rounded-xl p-4 border border-purple-400/30">
                <h4 className="text-sm font-medium text-white mb-2">Connection to Main Thread</h4>
                <p className="text-xs text-purple-200 mb-3">
                  You've explored {mainConversations.length} thoughts in your main conversation.
                  This sandbox keeps your journey intact.
                </p>
                <div className="text-xs text-gray-300 space-y-1">
                  <div className="flex items-center gap-2">
                    <span>🧵</span>
                    <span>Main thread preserved</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>🔒</span>
                    <span>Local exploration only</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>💭</span>
                    <span>Insights will be woven back</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Sandbox Conversation */}
          <div className="w-2/3 flex flex-col">
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-white">Sandbox Exploration</h3>
                  <p className="text-xs text-gray-300">
                    {explorationFocus ? `Focus: ${focusOptions.find(f => f.id === explorationFocus)?.label}` : 'Choose a focus area to begin'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleReturnWithInsights}
                    disabled={sandboxConversations.length === 0}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all"
                  >
                    Weave Back Insights
                  </button>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white text-xl transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {!explorationFocus ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-6">🎯</div>
                  <h4 className="text-xl font-medium text-white mb-3">Choose Your Exploration Lens</h4>
                  <p className="text-gray-300 text-sm max-w-md mx-auto">
                    Select a focus area to begin your deep dive into "{option.title}". Each lens will help you explore different dimensions of this choice.
                  </p>
                </div>
              ) : sandboxConversations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-6">💭</div>
                  <h4 className="text-xl font-medium text-white mb-3">Ready to Explore</h4>
                  <p className="text-gray-300 text-sm mb-6 max-w-md mx-auto">
                    What questions do you have about "{option.title}" through the lens of {focusOptions.find(f => f.id === explorationFocus)?.label.toLowerCase()}?
                  </p>
                  <div className="bg-blue-500/20 rounded-xl p-4 max-w-md mx-auto border border-blue-400/30">
                    <p className="text-blue-200 text-xs">
                      This is your private exploration space. Nothing here affects your main conversation until you choose to weave insights back.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {sandboxConversations.map((conv, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex justify-end">
                        <div className="bg-blue-600/30 backdrop-blur-sm rounded-2xl rounded-br-sm px-4 py-2 max-w-xs">
                          <p className="text-sm text-white">{conv.user}</p>
                        </div>
                      </div>

                      {conv.sage && (
                        <div className="flex justify-start">
                          <div className="bg-white/10 backdrop-blur-sm rounded-2xl rounded-bl-sm px-4 py-2 max-w-xs">
                            <p className="text-sm text-gray-200">{conv.sage}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl rounded-bl-sm px-4 py-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {explorationFocus && (
              <div className="p-4 border-t border-white/10">
                <SageChat
                  conversations={sandboxConversations}
                  onSendMessage={handleSendMessage}
                  isTyping={isTyping}
                  placeholder={`Explore ${option.title} through ${focusOptions.find(f => f.id === explorationFocus)?.label.toLowerCase()}...`}
                  hideHeader={true}
                  compact={true}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReflectionSandbox;