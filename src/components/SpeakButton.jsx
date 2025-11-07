
import React, { useState, useEffect } from 'react';

export default function SpeakButton({ text, disabled = false }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('speechSynthesis' in window);
  }, []);

  useEffect(() => {
    const handleSpeechEnd = () => {
      setIsSpeaking(false);
    };

    if (isSupported) {
      speechSynthesis.addEventListener('voiceschanged', handleSpeechEnd);
      return () => {
        speechSynthesis.removeEventListener('voiceschanged', handleSpeechEnd);
      };
    }
  }, [isSupported]);

  const speak = () => {
    if (!isSupported || disabled || !text) return;

    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice settings for Sage
    utterance.rate = 0.9; // Slightly slower for contemplative feel
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    // Try to use a pleasant voice if available
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Female') || 
      voice.name.includes('Samantha') ||
      voice.name.includes('Alex')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthesis.speak(utterance);
  };

  if (!isSupported) {
    return null; // Hide button if not supported
  }

  return (
    <button
      onClick={speak}
      disabled={disabled || !text}
      className={`text-xs px-2 py-1 rounded-full transition-all ${
        isSpeaking
          ? 'bg-purple-600 text-white animate-pulse'
          : 'bg-white/10 hover:bg-white/20 text-purple-300 hover:text-white'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isSpeaking ? 'Click to stop speaking' : 'Listen to Sage'}
    >
      {isSpeaking ? '🔊' : '🔈'}
    </button>
  );
}