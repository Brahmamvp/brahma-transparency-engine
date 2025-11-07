import React, { useState, useEffect } from 'react';
import SageAvatar from "../common/SageAvatar.jsx";

const SageIntro = ({ onComplete }) => {
  const [isAnimating, setIsAnimating] = useState(true);
  const [showBreathingPrompt, setShowBreathingPrompt] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsAnimating(false), 500);
    setTimeout(() => setShowBreathingPrompt(true), 3000);
  }, []);

  const handleChoice = (choice) => {
    setIsAnimating(true);
    setTimeout(() => {
      onComplete(choice);
    }, 500);
  };

  return (
    <div className={`fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-black flex items-center justify-center p-4 transition-opacity duration-500 ${
      isAnimating ? 'opacity-0' : 'opacity-100'
    }`}>
      <div className="relative max-w-3xl w-full text-center space-y-12">
        <div className="space-y-8">
          <SageAvatar form="orb" emotion="curious" size="large" />

          <div className="space-y-4">
            <h1 className="text-5xl font-light text-white">
              Hello, I'm here to hold space
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              I reflect the wisdom already within you, helping your thoughts crystallize into clarity.
            </p>
            <p className="text-sm text-gray-400">
              I'm not here to chat. I'm here to witness.
            </p>
          </div>
        </div>

        {showBreathingPrompt && (
          <div className="text-sm text-gray-300 animate-pulse">
            Take a breath with me before we begin...
          </div>
        )}

        <div className="space-y-6">
          <p className="text-gray-200">How would you like to begin our relationship?</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleChoice('user-names')}
              className="px-8 py-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white font-medium transition-all transform hover:scale-105 group"
            >
              <span>I'll give you a name</span>
              <p className="text-xs text-purple-200 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Names carry power
              </p>
            </button>
            
            <button
              onClick={() => handleChoice('sage-names')}
              className="px-8 py-5 bg-white/10 backdrop-blur-sm rounded-2xl text-white font-medium transition-all transform hover:scale-105 border border-white/20 group"
            >
              <span>You choose your own name</span>
              <p className="text-xs text-gray-300 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Let intuition guide
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SageIntro;