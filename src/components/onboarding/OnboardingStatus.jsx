import React, { useState } from 'react';
import SageAvatar from "../common/SageAvatar.jsx";

const OnboardingStatus = ({ onComplete, sageData }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState({
    lifeStatus: '',
    emotionalState: '',
    timeAvailability: '',
    primaryNeed: '',
    boundaries: '',
    memoryPreference: ''
  });

  const steps = [
    {
      id: 'life',
      title: 'What season of life are you moving through?',
      field: 'lifeStatus',
      options: [
        { value: 'exploring', label: 'Spring - New growth', emoji: '🌱' },
        { value: 'transition', label: 'Summer - In full bloom', emoji: '🦋' },
        { value: 'building', label: 'Autumn - Harvesting', emoji: '🍂' },
        { value: 'maintaining', label: 'Winter - Rest & reflection', emoji: '❄️' }
      ]
    },
    {
      id: 'emotional',
      title: "What's the shape of your inner weather?",
      field: 'emotionalState',
      options: [
        { value: 'stormy', label: 'Stormy', emoji: '⛈️' },
        { value: 'foggy', label: 'Foggy', emoji: '🌫️' },
        { value: 'clear', label: 'Clear skies', emoji: '☀️' },
        { value: 'changing', label: 'Changing', emoji: '🌤️' }
      ]
    },
    {
      id: 'boundaries',
      title: 'How shall we work together?',
      field: 'boundaries',
      options: [
        { value: 'gentle', label: 'Gentle touch - Soft suggestions', emoji: '🪶' },
        { value: 'challenge', label: 'Challenge me - Hard truths welcome', emoji: '🔥' },
        { value: 'flow', label: 'Flow with me - Match my energy', emoji: '🌊' }
      ]
    },
    {
      id: 'memory',
      title: 'How should I remember our conversations?',
      field: 'memoryPreference',
      options: [
        { value: 'everything', label: 'Sacred Memory - Remember all', emoji: '🕊️' },
        { value: 'fresh', label: 'Flow State - Start fresh each time', emoji: '🌊' },
        { value: 'insights', label: 'Selective - Remember insights only', emoji: '💎' }
      ]
    },
    {
      id: 'need',
      title: 'What would be most helpful right now?',
      field: 'primaryNeed',
      options: [
        { value: 'clarity', label: 'Clarity on decisions', emoji: '💎' },
        { value: 'witness', label: 'Someone to witness', emoji: '👁️' },
        { value: 'reflection', label: 'Space to reflect', emoji: '🪞' },
        { value: 'exploration', label: 'Open exploration', emoji: '🔍' }
      ]
    }
  ];

  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    const profileData = {
      ...profile,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('brahma_user_profile', JSON.stringify(profileData));
    localStorage.setItem('onboardingComplete', 'true');

    onComplete(profileData);
  };

  const updateProfile = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-black flex items-center justify-center p-4">
      <div className="relative max-w-2xl w-full">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-400">Moment {currentStep + 1} of {steps.length}</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-10 border border-white/20">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <SageAvatar 
                form={sageData.form} 
                emotion={sageData.emotion} 
                size="medium" 
              />
              <h2 className="text-2xl font-light text-white">{currentStepData.title}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentStepData.options.map(option => (
                <button
                  key={option.value}
                  onClick={() => updateProfile(currentStepData.field, option.value)}
                  className={`p-5 rounded-xl border-2 transition-all text-left group ${
                    profile[currentStepData.field] === option.value
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-white/20 hover:border-white/40 bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl group-hover:scale-110 transition-transform">
                      {option.emoji}
                    </span>
                    <span className="text-white">{option.label}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex-1 py-4 bg-white/10 rounded-2xl text-white font-medium hover:bg-white/20 transition-all"
                >
                  Reconsider
                </button>
              )}
              
              <button
                onClick={handleNext}
                disabled={!profile[currentStepData.field]}
                className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white font-medium disabled:opacity-50 transition-all"
              >
                {currentStep === steps.length - 1 ? 'Begin Our Journey' : 'Deepen'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingStatus;