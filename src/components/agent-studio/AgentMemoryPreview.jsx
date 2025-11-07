import React, { useState } from 'react';
import { Brain } from 'lucide-react';

const AgentMemoryPreview = ({ agent, onUpdate, className = "" }) => {
  const [hiddenFields, setHiddenFields] = useState(new Set());

  const memoryFields = [
    { key: 'name', label: 'Name', value: agent.name },
    { key: 'role', label: 'Role', value: agent.role },
    { key: 'corePrompt', label: 'Core Personality', value: agent.corePrompt },
    { key: 'intent', label: 'Core Intent', value: agent.ethics?.intent },
    { key: 'emotionalTone', label: 'Emotional Approach', value: agent.ethics?.emotionalTone },
    { key: 'redLines', label: 'Boundaries', value: agent.ethics?.redLines?.join(', ') },
    { key: 'longTermPurpose', label: 'Long-term Purpose', value: agent.ethics?.longTermPurpose },
  ].filter(field => field.value);

  const toggleField = (fieldKey) => {
    setHiddenFields(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fieldKey)) {
        newSet.delete(fieldKey);
      } else {
        newSet.add(fieldKey);
      }
      return newSet;
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <Brain className="text-purple-600" size={24} />
        <div>
          <h3 className="text-lg font-medium text-gray-800">Memory Preview</h3>
          <p className="text-sm text-gray-600">Review what your agent will remember about itself</p>
        </div>
      </div>

      <div className="bg-white/30 backdrop-blur-md border border-white/30 rounded-xl p-4">
        <div className="space-y-3">
          {memoryFields.map(field => (
            <div key={field.key} className={`p-3 rounded-lg border transition-all ${
              hiddenFields.has(field.key) 
                ? 'bg-red-50 border-red-200 opacity-50' 
                : 'bg-white/20 border-white/20'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{field.label}</span>
                <button
                  onClick={() => toggleField(field.key)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    hiddenFields.has(field.key)
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {hiddenFields.has(field.key) ? 'Hidden' : 'Visible'}
                </button>
              </div>
              <p className="text-sm text-gray-600">{field.value}</p>
            </div>
          ))}
        </div>

        {hiddenFields.size > 0 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-700">
              {hiddenFields.size} field{hiddenFields.size === 1 ? '' : 's'} will be hidden from this agent's memory
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentMemoryPreview;
