import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Volume2, RotateCcw } from 'lucide-react';

const PasteAndListen = () => {
  const [text, setText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [rate, setRate] = useState(1);
  const [progress, setProgress] = useState(0);
  const [currentUtterance, setCurrentUtterance] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [currentWord, setCurrentWord] = useState(0);

  // Load text from localStorage on mount
  useEffect(() => {
    const savedText = localStorage.getItem('ttsText');
    if (savedText) {
      setText(savedText);
    }
  }, []);

  // Save text to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('ttsText', text);
    setWordCount(text.trim().split(/\s+/).filter(word => word.length > 0).length);
  }, [text]);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Default to first female US English voice
      const defaultVoice = availableVoices.find(voice => 
        voice.lang.includes('en-US') && voice.name.toLowerCase().includes('female')
      ) || availableVoices.find(voice => 
        voice.lang.includes('en-US')
      ) || availableVoices[0];
      
      setSelectedVoice(defaultVoice);
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
    
    return () => speechSynthesis.removeEventListener('voiceschanged', loadVoices);
  }, []);

  const speak = (textToSpeak) => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }

    if (!textToSpeak.trim()) return;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.voice = selectedVoice;
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Track progress through words
    const words = textToSpeak.trim().split(/\s+/);
    let wordIndex = 0;

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        wordIndex++;
        setCurrentWord(wordIndex);
        setProgress((wordIndex / words.length) * 100);
      }
    };

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setCurrentWord(0);
      setProgress(0);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(100);
      setCurrentWord(wordCount);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    setCurrentUtterance(utterance);
    speechSynthesis.speak(utterance);
  };

  const handlePlay = () => {
    if (isPaused && speechSynthesis.paused) {
      speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    } else {
      speak(text);
    }
  };

  const handlePause = () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    setCurrentWord(0);
  };

  const handleRestart = () => {
    handleStop();
    setTimeout(() => speak(text), 100);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-light text-gray-800">Paste & Listen</h1>
        <p className="text-gray-600 font-light">Let Sage read your text aloud</p>
      </div>

      {/* Main Content Card */}
      <div className="backdrop-blur-md bg-white/30 rounded-2xl shadow-lg border border-white/20 p-8 space-y-6">
        {/* Text Input Area */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Your Text
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your notes, articles, or any text you'd like to hear..."
            className="w-full h-64 p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white/50 backdrop-blur-sm"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>{wordCount} words</span>
            <span>~{Math.ceil(wordCount / 150)} min read</span>
          </div>
        </div>

        {/* Progress Bar */}
        {(isPlaying || isPaused || progress > 0) && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{currentWord} / {wordCount} words</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center space-x-4">
          {!isPlaying && !isPaused ? (
            <button
              onClick={handlePlay}
              disabled={!text.trim()}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Play className="w-5 h-5" />
              <span>Read Aloud</span>
            </button>
          ) : (
            <div className="flex space-x-3">
              {isPlaying ? (
                <button
                  onClick={handlePause}
                  className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-3 rounded-xl hover:bg-gray-600 transition-all"
                >
                  <Pause className="w-5 h-5" />
                  <span>Pause</span>
                </button>
              ) : (
                <button
                  onClick={handlePlay}
                  className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  <Play className="w-5 h-5" />
                  <span>Resume</span>
                </button>
              )}
              
              <button
                onClick={handleStop}
                className="flex items-center space-x-2 bg-red-500 text-white px-4 py-3 rounded-xl hover:bg-red-600 transition-all"
              >
                <Square className="w-5 h-5" />
                <span>Stop</span>
              </button>
              
              <button
                onClick={handleRestart}
                className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-3 rounded-xl hover:bg-blue-600 transition-all"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Restart</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      <div className="backdrop-blur-md bg-white/20 rounded-2xl shadow-lg border border-white/20 p-6 space-y-4">
        <h3 className="text-lg font-medium text-gray-800 flex items-center space-x-2">
          <Volume2 className="w-5 h-5" />
          <span>Voice Settings</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Voice Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Voice
            </label>
            <select
              value={selectedVoice?.name || ''}
              onChange={(e) => {
                const voice = voices.find(v => v.name === e.target.value);
                setSelectedVoice(voice);
              }}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white/60"
            >
              {voices
                .filter(voice => voice.lang.includes('en'))
                .map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Speed Control */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Speed: {rate}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${((rate - 0.5) / 1.5) * 100}%, #E5E7EB ${((rate - 0.5) / 1.5) * 100}%, #E5E7EB 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0.5x</span>
              <span>Normal</span>
              <span>2x</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="backdrop-blur-md bg-white/20 rounded-2xl shadow-lg border border-white/20 p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setText('')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
          >
            Clear Text
          </button>
          <button
            onClick={() => {
              const sampleText = "Welcome to Brahma's text-to-speech feature. This is Sage speaking. I'm here to help you process information in whatever way feels most natural to you. Whether you're tired from reading, prefer auditory learning, or just want to give your eyes a rest, I'm happy to read your content aloud.";
              setText(sampleText);
            }}
            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all"
          >
            Try Sample Text
          </button>
        </div>
      </div>

      {/* Status Footer */}
      <div className="text-center text-sm text-gray-500">
        {isPlaying && "🔊 Sage is speaking..."}
        {isPaused && "⏸️ Paused - click Resume to continue"}
        {!isPlaying && !isPaused && text.trim() && "Ready to read aloud"}
        {!text.trim() && "Paste some text above to get started"}
      </div>
    </div>
  );
};

export default PasteAndListen;