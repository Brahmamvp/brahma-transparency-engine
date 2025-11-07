import React, { useState, useEffect, useRef } from 'react';

const VoiceInput = ({ onResult, isOpen, onClose }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
        onClose();
      };
      
      recognitionRef.current.onerror = () => {
        setError('Speech recognition failed');
        setIsRecording(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, [onResult, onClose]);

  const startRecording = () => {
    if (recognitionRef.current) {
      setError(null);
      setIsRecording(true);
      recognitionRef.current.start();
    } else {
      setError('Speech recognition not supported');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-sm w-full border border-white/20">
        <div className="text-center mb-6">
          <div className="text-2xl mb-3">🎙️</div>
          <h3 className="text-lg font-semibold text-white mb-2">Voice Input</h3>
          <p className="text-gray-300 text-sm">Speak your thoughts to Sage</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4 text-center">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="text-center mb-6">
          {!isRecording ? (
            <button onClick={startRecording} className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 mx-auto">
              <div className="w-6 h-6 bg-white rounded-full"></div>
            </button>
          ) : (
            <button onClick={stopRecording} className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto relative">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
              <div className="absolute inset-0 border-4 border-white/30 rounded-full animate-ping"></div>
            </button>
          )}
          <p className="text-sm text-gray-400 mt-3">{isRecording ? 'Listening...' : 'Tap to start speaking'}</p>
        </div>

        <button onClick={onClose} className="w-full bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-white font-medium transition-colors">Cancel</button>
      </div>
    </div>
  );
};

export default VoiceInput;