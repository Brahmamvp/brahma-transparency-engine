// src/components/ContextEditorModal.jsx
import React, { useState, useEffect } from "react";
import { X, Save, Settings, Heart, MapPin, DollarSign, AlertTriangle } from "lucide-react";

const MOOD_OPTIONS = [
  "Clear", "Anxious", "Motivated", "Overwhelmed", "Hopeful", "Flowing", "Drained"
];

const ContextEditorModal = ({ isOpen, onClose, currentContext, updateContext }) => {
  // Use local state to manage form input, initialized with current context data
  const [formData, setFormData] = useState(currentContext);

  // Update form data if the currentContext prop changes while the modal is closed
  useEffect(() => {
    if (!isOpen) {
      setFormData(currentContext);
    }
  }, [isOpen, currentContext]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle nested properties (e.g., userLocation.neighborhoodTag)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } 
    // Handle array properties (simple strings separated by commas)
    else if (["logisticalFriction", "culturalContext", "economicCeiling", "identitySignals"].includes(name)) {
      setFormData(prev => ({
        ...prev,
        [name]: value.split(',').map(item => item.trim()).filter(item => item.length > 0)
      }));
    }
    // Handle simple top-level properties
    else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 1. Clean up formData to match the expected structure
    const newContext = {
      ...currentContext, // Preserve any keys not explicitly in the form
      ...formData,
    };
    
    // 2. Call the update function passed down from the LocalMemoryContext
    updateContext(newContext);
    
    // 3. Close the modal
    onClose();
    console.log("Context updated by user:", newContext);
  };
  
  // Helper to safely convert array back to comma-separated string for form value
  const arrayToString = (arr) => Array.isArray(arr) ? arr.join(', ') : '';

  return (
    // Editor Modal Overlay (Fixed, Full Screen)
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      
      {/* Editor Panel */}
      <div className="bg-gray-800 border border-purple-600/50 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 p-6 border-b border-purple-700 bg-gray-800 z-10">
          <div className="flex justify-between items-center">
            <h2 className="flex items-center text-xl font-bold text-white">
              <Settings size={24} className="mr-3 text-purple-400" />
              Edit Ambient Context
            </h2>
            <button 
              onClick={onClose} 
              className="p-2 rounded-full text-gray-400 hover:bg-purple-700 transition-colors"
              title="Close Editor"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-sm text-purple-300 mt-1">
            Manually override the AI's real-time perception of your state.
          </p>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Section: Emotional State */}
          <h3 className="flex items-center gap-2 text-lg font-semibold text-white border-b border-gray-700 pb-2">
            <Heart size={20} className="text-red-400" /> Emotional State
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Current Emotional Tone</label>
            <select
              name="currentEmotionalTone"
              value={formData.currentEmotionalTone}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-purple-500 focus:border-purple-500"
            >
              {MOOD_OPTIONS.map(mood => (
                <option key={mood} value={mood}>{mood}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">This directly influences Sage's conversational tone.</p>
          </div>
          
          {/* Section: Geographic/Logistical */}
          <h3 className="flex items-center gap-2 text-lg font-semibold text-white border-b border-gray-700 pb-2">
            <MapPin size={20} className="text-blue-400" /> Location & Logistics
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Neighborhood Tag</label>
            <input
              type="text"
              name="userLocation.neighborhoodTag"
              value={formData.userLocation?.neighborhoodTag || ''}
              onChange={handleChange}
              placeholder="e.g., Home, Office, Travel"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Logistical Friction Points (comma-separated)</label>
            <input
              type="text"
              name="logisticalFriction"
              value={arrayToString(formData.logisticalFriction)}
              onChange={handleChange}
              placeholder="e.g., Poor Wi-Fi, Loud Background, Low Battery"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
            {formData.logisticalFriction?.length > 1 && (
              <div className="flex items-center text-xs text-orange-400 mt-1">
                <AlertTriangle size={14} className="mr-1" /> High friction detected. Sage will offer simpler steps.
              </div>
            )}
          </div>
          
          <div className="flex items-center pt-2">
            <input
              id="transitDependency"
              type="checkbox"
              name="userLocation.transitDependency"
              checked={formData.userLocation?.transitDependency || false}
              onChange={handleChange}
              className="h-4 w-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
            />
            <label htmlFor="transitDependency" className="ml-2 text-sm text-gray-300">
              Transit Dependent (Limits suggestions requiring personal vehicle)
            </label>
          </div>
          
          {/* Section: Economic/Cultural */}
          <h3 className="flex items-center gap-2 text-lg font-semibold text-white border-b border-gray-700 pb-2">
            <DollarSign size={20} className="text-green-400" /> Economic & Cultural
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Cultural Tags (comma-separated)</label>
            <input
              type="text"
              name="culturalContext"
              value={arrayToString(formData.culturalContext)}
              onChange={handleChange}
              placeholder="e.g., Family-focused, Budget-conscious"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Economic Ceiling Events (comma-separated)</label>
            <input
              type="text"
              name="economicCeiling"
              value={arrayToString(formData.economicCeiling)}
              onChange={handleChange}
              placeholder="e.g., Recent Major Expense, Salary Freeze"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>

          {/* Footer / Submit */}
          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
            >
              <Save size={16} />
              Save Context
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContextEditorModal;
