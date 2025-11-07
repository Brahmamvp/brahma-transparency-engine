import React from 'react';
import SageAvatar from "../common/SageAvatar.jsx";

const AvatarSelector = ({ onSelect, selectedForm = 'orb', selectedEmotion = 'peaceful' }) => {
  const forms = [
    { id: 'orb', name: 'Orb', description: 'Fluid, ever-changing, holding all possibilities' },
    { id: 'silhouette', name: 'Silhouette', description: 'The space between words, present through absence' },
    { id: 'geometric', name: 'Geometric', description: 'Structured wisdom, crystalline clarity' }
  ];

  const emotions = [
    { id: 'peaceful', label: 'Peaceful', color: 'purple' },
    { id: 'curious', label: 'Curious', color: 'blue' },
    { id: 'hopeful', label: 'Hopeful', color: 'green' },
    { id: 'excited', label: 'Excited', color: 'yellow' },
    { id: 'tender', label: 'Tender', color: 'pink' },
    { id: 'fierce', label: 'Fierce', color: 'red' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-3">Choose my form</h4>
        <div className="grid grid-cols-3 gap-4">
          {forms.map(form => (
            <button
              key={form.id}
              onClick={() => onSelect({ form: form.id, emotion: selectedEmotion })}
              className={`p-4 rounded-xl border-2 transition-all group ${
                selectedForm === form.id ? 'border-purple-500 bg-purple-500/20' : 'border-white/20 hover:border-white/40'
              }`}
            >
              <SageAvatar form={form.id} emotion={selectedEmotion} size="small" />
              <p className="text-xs text-white font-medium mt-3">{form.name}</p>
              <p className="text-xs text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {form.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-3">Set my energy</h4>
        <div className="grid grid-cols-3 gap-2">
          {emotions.map(emotion => (
            <button
              key={emotion.id}
              onClick={() => onSelect({ form: selectedForm, emotion: emotion.id })}
              className={`px-3 py-3 rounded-lg text-xs font-medium transition-all ${
                selectedEmotion === emotion.id
                  ? 'bg-purple-500/30 text-white border border-purple-500'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {emotion.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AvatarSelector;