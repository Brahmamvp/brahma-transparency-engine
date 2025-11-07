
import React, { useState } from 'react';
import GlassPanel from './GlassPanel';
import LayerTagSelector from './LayerTagSelector';
import VoiceEntryModal from './VoiceEntryModal';

export default function ContextCapture({ onCapture, selectedLayer, onLayerChange }) {
  const [text, setText] = useState('');
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  const handleCapture = () => {
    if (text.trim()) {
      onCapture({
        text: text.trim(),
        layer: selectedLayer,
        timestamp: new Date(),
        type: 'text'
      });
      setText('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCapture();
    }
  };

  const handleVoiceCapture = () => {
    setShowVoiceModal(true);
  };

  const handleVoiceData = (voiceData) => {
    onCapture({
      text: voiceData.text,
      layer: selectedLayer,
      timestamp: new Date(),
      type: 'voice'
    });
    setShowVoiceModal(false);
  };

  return (
    <>
      <GlassPanel className="p-6 mb-6">
        <h3 className="text-white text-lg font-medium mb-4">Capture Context</h3>
        
        <LayerTagSelector 
          selectedLayer={selectedLayer} 
          onLayerChange={onLayerChange} 
        />

        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your thought or context here..."
            className="w-full h-24 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none"
          />
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleVoiceCapture}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                title="Voice capture"
              >
                🎤
              </button>
              <span className="text-white/60 text-sm">
                Selected layer: <span className="capitalize text-purple-300">{selectedLayer}</span> • Press Enter to capture
              </span>
            </div>
            <button
              onClick={handleCapture}
              disabled={!text.trim()}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white rounded-full font-medium transition-colors button-glow disabled:shadow-none"
            >
              Capture
            </button>
          </div>
        </div>

        <button 
          className="w-full mt-4 text-purple-300 hover:text-purple-200 text-sm transition-colors"
          onClick={() => {
            // TODO: Add emotional context selector modal
            console.log('Emotional context selector - to be implemented');
          }}
        >
          Add emotional context
        </button>
      </GlassPanel>

      {showVoiceModal && (
        <VoiceEntryModal 
          onClose={() => setShowVoiceModal(false)}
          onCapture={handleVoiceData}
        />
      )}
    </>
  );
}
