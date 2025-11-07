import React, { useState, useEffect, useCallback } from 'react';

// Speech to Text Hook
const useSpeechToText = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript + ' ');
        }
      };

      recognitionInstance.onstart = () => setIsListening(true);
      recognitionInstance.onend = () => setIsListening(false);
      recognitionInstance.onerror = () => setIsListening(false);

      setRecognition(recognitionInstance);
      setIsSupported(true);
    }
  }, []);

  const start = useCallback(() => {
    if (recognition && !isListening) {
      setTranscript('');
      recognition.start();
    }
  }, [recognition, isListening]);

  const stop = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
    }
  }, [recognition, isListening]);

  const reset = useCallback(() => {
    setTranscript('');
  }, []);

  return { isSupported, isListening, transcript, start, stop, reset };
};

// Text to Speech Hook
const useTextToSpeech = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      if (!selectedVoice && availableVoices.length > 0) {
        const defaultVoice = availableVoices.find(voice => 
          voice.lang.includes('en-US') && voice.name.toLowerCase().includes('female')
        ) || availableVoices.find(voice => voice.lang.includes('en-US')) || availableVoices[0];
        setSelectedVoice(defaultVoice);
      }
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => speechSynthesis.removeEventListener('voiceschanged', loadVoices);
  }, [selectedVoice]);

  const speak = useCallback((text) => {
    if (!text.trim()) return;
    
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    
    speechSynthesis.speak(utterance);
  }, [selectedVoice]);

  const cancel = useCallback(() => {
    speechSynthesis.cancel();
    setIsPlaying(false);
  }, []);

  const isSupported = 'speechSynthesis' in window;

  return { isSupported, isPlaying, voices, selectedVoice, speak, cancel };
};

// Main Voice Controls Component
const VoiceControls = ({ onTranscript, ttsText, className = '' }) => {
  const { 
    isSupported: sttSupported, 
    isListening, 
    transcript, 
    start: startListening, 
    stop: stopListening, 
    reset: resetTranscript 
  } = useSpeechToText();
  
  const { 
    isSupported: ttsSupported, 
    isPlaying, 
    speak, 
    cancel 
  } = useTextToSpeech();

  // Pass transcript to parent when it changes
  useEffect(() => {
    if (transcript && onTranscript) {
      onTranscript(transcript);
      resetTranscript();
    }
  }, [transcript, onTranscript, resetTranscript]);

  const handleDictate = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleReadAloud = () => {
    if (isPlaying) {
      cancel();
    } else if (ttsText) {
      speak(ttsText);
    }
  };

  const handleStop = () => {
    if (isListening) stopListening();
    if (isPlaying) cancel();
  };

  if (!sttSupported && !ttsSupported) {
    return null; // Hide if no speech features available
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Dictate Button */}
      {sttSupported && (
        <button
          onClick={handleDictate}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            isListening 
              ? 'bg-red-500 text-white animate-pulse' 
              : 'glassmorphism text-white hover:glassmorphism-strong'
          }`}
          title={isListening ? 'Stop dictating' : 'Start dictating'}
        >
          <span className="text-lg">🎤</span>
          <span className="text-sm font-medium">
            {isListening ? 'Stop' : 'Dictate'}
          </span>
        </button>
      )}

      {/* Read Aloud Button */}
      {ttsSupported && ttsText && (
        <button
          onClick={handleReadAloud}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            isPlaying 
              ? 'bg-green-500 text-white' 
              : 'glassmorphism text-white hover:glassmorphism-strong'
          }`}
          title={isPlaying ? 'Stop reading' : 'Read aloud'}
        >
          <span className="text-lg">🔊</span>
          <span className="text-sm font-medium">
            {isPlaying ? 'Stop' : 'Read Aloud'}
          </span>
        </button>
      )}

      {/* Universal Stop Button */}
      {(isListening || isPlaying) && (
        <button
          onClick={handleStop}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
          title="Stop all audio"
        >
          <span className="text-lg">⏹</span>
          <span className="text-sm font-medium">Stop</span>
        </button>
      )}

      {/* Status Indicator */}
      {(isListening || isPlaying) && (
        <div className="flex items-center gap-2 px-3 py-2 bg-black/30 rounded-lg">
          <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-400 animate-pulse' : 'bg-green-400 animate-pulse'}`} />
          <span className="text-xs text-white/80">
            {isListening ? 'Listening...' : 'Speaking...'}
          </span>
        </div>
      )}
    </div>
  );
};

export default VoiceControls;