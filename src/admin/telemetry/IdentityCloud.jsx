import React, { useState, useEffect } from 'react';
import { Cloud, RefreshCw } from 'lucide-react';

const IdentityCloud = ({ reflections = [], title = "Identity Signals" }) => {
  const [words, setWords] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // Sample identity words for demonstration
  const sampleWords = [
    { text: 'curious', frequency: 8, category: 'growth' },
    { text: 'anxious', frequency: 5, category: 'challenge' },
    { text: 'hopeful', frequency: 12, category: 'growth' },
    { text: 'stuck', frequency: 3, category: 'challenge' },
    { text: 'creative', frequency: 7, category: 'strength' },
    { text: 'overwhelmed', frequency: 4, category: 'challenge' },
    { text: 'determined', frequency: 9, category: 'strength' },
    { text: 'uncertain', frequency: 6, category: 'challenge' },
    { text: 'peaceful', frequency: 5, category: 'growth' },
    { text: 'restless', frequency: 4, category: 'challenge' },
    { text: 'grateful', frequency: 10, category: 'growth' },
    { text: 'searching', frequency: 7, category: 'growth' },
  ];

  useEffect(() => {
    setWords(sampleWords);
  }, [reflections]);

  const getWordSize = (frequency) => {
    const minSize = 12;
    const maxSize = 32;
    const maxFreq = Math.max(...words.map(w => w.frequency));
    return minSize + (frequency / maxFreq) * (maxSize - minSize);
  };

  const getWordColor = (category) => {
    const colors = {
      growth: 'text-green-600',
      strength: 'text-purple-600', 
      challenge: 'text-orange-600',
      neutral: 'text-gray-600'
    };
    return colors[category] || colors.neutral;
  };

  const refreshCloud = () => {
    setIsAnimating(true);
    setTimeout(() => {
      // Simulate word frequency changes
      const updatedWords = words.map(word => ({
        ...word,
        frequency: Math.max(1, word.frequency + Math.floor(Math.random() * 3) - 1)
      }));
      setWords(updatedWords);
      setIsAnimating(false);
    }, 500);
  };

  return (
    <div className="backdrop-blur-md bg-white/30 rounded-2xl shadow-lg border border-white/20 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-medium text-gray-800 flex items-center space-x-2">
          <Cloud className="w-6 h-6 text-blue-500" />
          <span>{title}</span>
        </h3>
        
        <button
          onClick={refreshCloud}
          className="flex items-center space-x-2 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${isAnimating ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Word Cloud */}
      {words.length > 0 ? (
        <div className="relative min-h-48 flex flex-wrap items-center justify-center gap-3 p-4 bg-gradient-to-br from-white/20 to-purple-50/30 rounded-xl">
          {words.map((word, index) => (
            <span
              key={word.text}
              className={`font-light cursor-pointer hover:scale-110 transition-all duration-300 ${getWordColor(word.category)} ${isAnimating ? 'opacity-50' : 'opacity-100'}`}
              style={{ 
                fontSize: `${getWordSize(word.frequency)}px`,
                animationDelay: `${index * 100}ms`
              }}
              title={`${word.frequency} mentions • ${word.category}`}
            >
              {word.text}
            </span>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Cloud className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-light">No identity words captured yet</p>
          <p className="text-sm">Words will appear as users reflect and journal</p>
        </div>
      )}

      {/* Category Legend */}
      <div className="flex justify-center space-x-6 mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Growth</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Strength</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Challenge</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-2xl font-light text-gray-800">{words.length}</p>
          <p className="text-sm text-gray-600">Unique Words</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-light text-gray-800">
            {words.reduce((sum, word) => sum + word.frequency, 0)}
          </p>
          <p className="text-sm text-gray-600">Total Mentions</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-light text-gray-800">
            {words.filter(w => w.category === 'growth').length}
          </p>
          <p className="text-sm text-gray-600">Growth Words</p>
        </div>
      </div>
    </div>
  );
};

export default IdentityCloud;