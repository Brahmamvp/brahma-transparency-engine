import React, { useState } from 'react';
import { MessageCircle, Play } from 'lucide-react';

const AgentPreview = ({ agent, onActivate, theme, className = "" }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const testScenarios = [
    "I'm feeling overwhelmed with a big decision",
    "Help me think through a career change",
    "I need creative ideas for a project",
    "I'm struggling with work-life balance"
  ];
  
  const generateResponse = (userMessage) => {
    const { personality, role, corePrompt, ethics } = agent;
    
    let baseResponse = "";
    let emotionalTone = ethics?.emotionalTone || "gently";
    
    if (personality.logical > 0.6) {
      if (emotionalTone === "boldly") {
        baseResponse = "Let me break this down analytically. ";
      } else {
        baseResponse = "Let me help you think through this systematically. ";
      }
    } else {
      if (emotionalTone === "boldly") {
        baseResponse = "I can feel the weight of this decision with you. ";
      } else {
        baseResponse = "I hear that this is really weighing on you. ";
      }
    }
    
    if (personality.directive > 0.6) {
      baseResponse += emotionalTone === "boldly" 
        ? "Here's what I strongly recommend: " 
        : "Here's what I suggest you consider: ";
    } else {
      baseResponse += "What feels most important to you about this? ";
    }
    
    if (personality.playful > 0.6) {
      baseResponse += "Let's explore this together! 🌟";
    } else {
      baseResponse += "Take your time working through this.";
    }
    
    if (ethics?.intent) {
      baseResponse += ` (Guided by: ${ethics.intent.substring(0, 50)}...)`;
    }
    
    return baseResponse;
  };
  
  const sendMessage = (message) => {
    const newMessages = [...messages, { type: 'user', content: message }];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);
    
    if (onActivate) onActivate(true);
    
    setTimeout(() => {
      const response = generateResponse(message);
      setMessages([...newMessages, { type: 'agent', content: response }]);
      setIsTyping(false);
      if (onActivate) onActivate(false);
    }, 1000 + Math.random() * 1000);
  };
  
  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-medium ${theme?.text.primary} flex items-center gap-2`}>
          <MessageCircle size={20} />
          Test Your Agent
        </h3>
        <button
          onClick={() => setMessages([])}
          className={`text-sm ${theme?.text.muted} hover:${theme?.text.primary} transition-colors`}
        >
          Clear Chat
        </button>
      </div>
      
      <div className={`${theme?.glass} border rounded-xl p-3 mb-4`}>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${theme?.accent} animate-pulse`}></div>
          <div>
            <div className={`font-medium ${theme?.text.primary}`}>{agent.name}</div>
            <div className={`text-xs ${theme?.text.muted} capitalize`}>
              {agent.role.replace('-', ' ')} • {agent.ethics?.emotionalTone || 'gentle'} approach
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className={`text-sm ${theme?.text.muted} mb-2`}>Quick test scenarios:</div>
        <div className="flex flex-wrap gap-2">
          {testScenarios.map((scenario, i) => (
            <button
              key={i}
              onClick={() => sendMessage(scenario)}
              className={`px-3 py-1 ${theme?.glass} border text-xs rounded-full transition-all hover:scale-105`}
            >
              {scenario}
            </button>
          ))}
        </div>
      </div>
      
      <div className={`${theme?.glass} border rounded-xl p-4 h-64 overflow-y-auto mb-4`}>
        {messages.length === 0 ? (
          <div className={`flex flex-col items-center justify-center text-center ${theme?.text.muted} py-8`}>
            <div className="mb-2">👋</div>
            <div>Start a conversation with {agent.name}</div>
            <div className="text-xs mt-2 opacity-70">
              {agent.ethics?.intent && `Intent: ${agent.ethics.intent.substring(0, 60)}...`}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message, i) => (
              <div
                key={i}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    message.type === 'user'
                      ? `bg-gradient-to-r ${theme?.accent} text-white`
                      : `${theme?.glass} border ${theme?.text.primary}`
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className={`${theme?.glass} border px-3 py-2 rounded-lg`}>
                  <div className="flex space-x-1">
                    <div className={`w-2 h-2 bg-gradient-to-r ${theme?.accent} rounded-full animate-bounce`}></div>
                    <div className={`w-2 h-2 bg-gradient-to-r ${theme?.accent} rounded-full animate-bounce`} style={{animationDelay: '0.1s'}}></div>
                    <div className={`w-2 h-2 bg-gradient-to-r ${theme?.accent} rounded-full animate-bounce`} style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && input.trim() && sendMessage(input)}
          placeholder="Type a message..."
          className={`flex-1 px-3 py-2 ${theme?.glass} border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm ${theme?.text.primary} placeholder-gray-400`}
        />
        <button
          onClick={() => input.trim() && sendMessage(input)}
          disabled={!input.trim()}
          className={`px-4 py-2 bg-gradient-to-r ${theme?.accent} hover:shadow-lg disabled:opacity-50 text-white rounded-lg transition-all`}
        >
          <Play size={16} />
        </button>
      </div>
    </div>
  );
};

export default AgentPreview;
