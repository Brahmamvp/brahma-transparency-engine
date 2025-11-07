import React from 'react';
import { Shield } from 'lucide-react';

const AgentEthicsForm = ({ agent, onUpdate, className = "" }) => {
  const ethicsData = agent.ethics || {
    intent: "",
    redLines: [],
    emotionalTone: "gently",
    longTermPurpose: ""
  };

  const redLineOptions = [
    "Give medical advice",
    "Provide financial recommendations", 
    "Share personal information",
    "Make decisions for the user",
    "Engage in harmful content",
    "Pretend to be human",
    "Override user preferences",
    "Store sensitive data"
  ];

  const handleRedLineToggle = (redLine) => {
    const current = ethicsData.redLines || [];
    const updated = current.includes(redLine) 
      ? current.filter(r => r !== redLine)
      : [...current, redLine];
    
    onUpdate({
      ...agent,
      ethics: { ...ethicsData, redLines: updated }
    });
  };

  const handleEthicsUpdate = (field, value) => {
    onUpdate({
      ...agent,
      ethics: { ...ethicsData, [field]: value }
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <Shield className="text-purple-600" size={24} />
        <div>
          <h3 className="text-xl font-medium text-gray-800">Agent Ethics & Intent</h3>
          <p className="text-sm text-gray-600">Define your agent's moral framework and boundaries</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What is this agent's core intent?
        </label>
        <textarea
          value={ethicsData.intent}
          onChange={(e) => handleEthicsUpdate('intent', e.target.value)}
          placeholder="Describe what you want this agent to help you accomplish..."
          rows={3}
          className="w-full px-4 py-3 bg-white/60 backdrop-blur-md border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          What should this agent never do?
        </label>
        <div className="grid grid-cols-2 gap-3">
          {redLineOptions.map(redLine => (
            <label key={redLine} className="flex items-center p-3 bg-white/60 backdrop-blur-md border border-white/40 rounded-lg cursor-pointer hover:bg-white/70 transition-colors">
              <input
                type="checkbox"
                checked={ethicsData.redLines?.includes(redLine) || false}
                onChange={() => handleRedLineToggle(redLine)}
                className="mr-3 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">{redLine}</span>
            </label>
          ))}
        </div>
        
        <div className="mt-3">
          <input
            type="text"
            placeholder="Add custom boundary..."
            className="w-full px-4 py-2 bg-white/60 backdrop-blur-md border border-white/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                handleRedLineToggle(e.target.value.trim());
                e.target.value = '';
              }
            }}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How should this agent handle sensitive conversations?
        </label>
        <select
          value={ethicsData.emotionalTone}
          onChange={(e) => handleEthicsUpdate('emotionalTone', e.target.value)}
          className="w-full px-4 py-3 bg-white/60 backdrop-blur-md border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
        >
          <option value="gently">Gently - Soft, careful approach</option>
          <option value="boldly">Boldly - Direct, confident guidance</option>
          <option value="neutrally">Neutrally - Balanced, objective tone</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What is this agent's long-term purpose? <span className="text-gray-500">(Optional)</span>
        </label>
        <textarea
          value={ethicsData.longTermPurpose}
          onChange={(e) => handleEthicsUpdate('longTermPurpose', e.target.value)}
          placeholder="What do you hope this agent will help you become or achieve over time?"
          rows={3}
          className="w-full px-4 py-3 bg-white/60 backdrop-blur-md border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
        />
      </div>
    </div>
  );
};

export default AgentEthicsForm;
