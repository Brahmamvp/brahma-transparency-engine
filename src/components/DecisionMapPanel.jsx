// src/components/DecisionMapPanel.jsx
import React from 'react';
import { 
  BarChart2, X, Plus, ChevronsRight, CheckCircle, 
  Flag, Anchor, Heart, Zap, AlertTriangle, Pin, 
  Clock, DollarSign 
} from 'lucide-react';

// A visual card component for a single decision option
const OptionCard = ({ option, handlePin, handleExplore }) => {
  const isPinned = option.pinned;

  const riskColor = {
    'Low': 'text-emerald-400 bg-emerald-900/50 border-emerald-600/50',
    'Medium': 'text-yellow-400 bg-yellow-900/50 border-yellow-600/50',
    'High': 'text-red-400 bg-red-900/50 border-red-600/50',
  }[option.risk] || 'text-gray-400 bg-gray-700/50 border-gray-600/50';

  return (
    <div className={`p-5 rounded-xl border ${isPinned ? 'border-purple-500 bg-purple-900/20' : 'border-gray-700 bg-gray-800/50'} shadow-lg transition-all duration-300 hover:border-purple-500/80`}>
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-xl font-semibold text-white flex items-center">
          {isPinned ? <Pin size={18} className="mr-2 text-purple-400 fill-purple-400" /> : <Flag size={18} className="mr-2 text-gray-500" />}
          {option.title}
        </h4>
        <button
          onClick={() => handlePin(option.id)}
          title={isPinned ? "Unpin Option" : "Pin for comparison"}
          className={`p-1.5 rounded-full transition-colors ${isPinned ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-gray-700 hover:bg-purple-600 text-gray-400'}`}
        >
          <Pin size={16} />
        </button>
      </div>
      
      <p className="text-gray-400 text-sm mb-4 italic">{option.description}</p>
      
      <div className="flex items-center space-x-2 text-sm mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${riskColor} flex items-center`}>
          <AlertTriangle size={14} className="mr-1" /> {option.risk} Risk
        </span>
        <span className="px-3 py-1 rounded-full text-xs font-medium border border-gray-600 bg-gray-700/50 text-gray-300 flex items-center">
          <DollarSign size={14} className="mr-1" /> {option.cost}
        </span>
        <span className="px-3 py-1 rounded-full text-xs font-medium border border-gray-600 bg-gray-700/50 text-gray-300 flex items-center">
          <Clock size={14} className="mr-1" /> {option.timeEstimate}
        </span>
      </div>

      <div className="mt-4 border-t border-gray-700 pt-3">
        <h5 className="text-sm font-medium text-gray-300 mb-2">Key Considerations:</h5>
        <ul className="space-y-1">
          {option.considerations.slice(0, 3).map((c, i) => (
            <li key={i} className="flex items-start text-xs text-gray-400">
              <CheckCircle size={14} className="mr-2 mt-0.5 flex-shrink-0 text-emerald-500" />
              {c}
            </li>
          ))}
          {option.considerations.length > 3 && (
            <li className="text-xs text-gray-500 italic">...and {option.considerations.length - 3} more.</li>
          )}
        </ul>
      </div>

      <div className="mt-5 flex justify-end">
        <button 
          onClick={() => handleExplore(option.id)}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-purple-600 hover:bg-purple-700 text-white flex items-center transition-colors"
        >
          Explore Path <ChevronsRight size={16} className="ml-2" />
        </button>
      </div>
    </div>
  );
};

// Main Decision Map Panel component
const DecisionMapPanel = ({ options, insights, actions }) => {
  // Use mock for now since the full data might be large
  const currentProblem = "Which job offer best aligns with long-term happiness and stability?";
  const problemTag = insights.find(i => i.tags.includes('work-life balance')) ? "WORK-LIFE BALANCE" : "COMPLEX CHOICE";

  const pinnedOptions = options.filter(o => o.pinned);
  const unpinnedOptions = options.filter(o => !o.pinned);

  // Helper for generating insight confidence color
  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return "text-red-400";
    if (confidence >= 0.5) return "text-orange-400";
    return "text-gray-400";
  }

  return (
    <div className="h-full overflow-y-auto p-8 bg-gray-900/50">
      <header className="mb-8 pb-4 border-b border-gray-700/50">
        <h1 className="text-3xl font-bold text-white flex items-center">
          <BarChart2 size={30} className="mr-3 text-red-500" />
          Decision Map: The Brahma View
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          This map visualizes the core problem, available decision paths, and your historical data insights.
        </p>
      </header>
      
      {/* Current Problem & Insights Section */}
      <section className="mb-10 p-6 bg-gray-800 rounded-xl shadow-inner border border-red-700/50">
        <div className="flex items-center mb-3">
          <Zap size={20} className="text-red-500 mr-2" />
          <h2 className="text-xl font-bold text-red-300">Core Problem Node</h2>
          <span className="ml-3 px-3 py-1 text-xs font-semibold rounded-full bg-red-900/70 text-red-300 border border-red-700">{problemTag}</span>
        </div>
        <p className="text-2xl font-light italic text-white leading-relaxed">
          {currentProblem}
        </p>

        {/* Linked Insights */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <h3 className="text-md font-semibold text-gray-300 mb-3 flex items-center">
            <Heart size={18} className="mr-2 text-pink-400" /> Linked Personal Insights
          </h3>
          <ul className="space-y-3">
            {insights.map(i => (
              <li key={i.id} className="p-3 bg-gray-700/50 rounded-lg flex justify-between items-center text-sm">
                <span className="text-gray-300">{i.content}</span>
                <span className={`font-semibold ${getConfidenceColor(i.confidence)} text-xs ml-4`}>
                    Confidence: {(i.confidence * 100).toFixed(0)}%
                </span>
              </li>
            ))}
            {insights.length === 0 && (
              <li className="text-gray-500 italic">No historical insights available for this topic yet.</li>
            )}
          </ul>
        </div>
      </section>

      {/* Decision Options (Paths) Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
                <Anchor size={24} className="mr-2 text-purple-400" /> Decision Paths ({options.length})
            </h2>
            <button
                className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-700 hover:bg-purple-700 text-white flex items-center transition-colors border border-gray-600"
            >
                <Plus size={16} className="mr-2" /> Add New Option
            </button>
        </div>

        {/* Pinned/Comparison Options */}
        {pinnedOptions.length > 0 && (
          <div className="mb-8 p-4 bg-purple-900/30 rounded-xl border border-purple-600/50">
            <h3 className="text-lg font-semibold text-purple-300 mb-4 flex items-center">
                <Pin size={18} className="mr-2 fill-purple-300" /> Pinned for Comparison
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pinnedOptions.map(option => (
                <OptionCard 
                  key={option.id} 
                  option={option} 
                  handlePin={actions.handlePinOption} 
                  handleExplore={actions.handleExploreOption}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* All Other Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {unpinnedOptions.map(option => (
            <OptionCard 
              key={option.id} 
              option={option} 
              handlePin={actions.handlePinOption} 
              handleExplore={actions.handleExploreOption}
            />
          ))}
        </div>
      </section>

      <footer className="mt-10 pt-6 border-t border-gray-800 text-center text-sm text-gray-500">
        Decision Map generated by Brahma Transparency Engine.
      </footer>
    </div>
  );
};

export default DecisionMapPanel;
