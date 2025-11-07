import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const ModelSelector = ({ theme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('Sage Default');

  const models = [
    { name: 'Sage Default', icon: '🧙‍♀️', description: 'Best for conversation and emotional intelligence.' },
    { name: 'GPT-5', icon: '⚡', description: 'Best for creative writing and code generation.' },
    { name: 'Claude Opus', icon: '📚', description: 'Best for reasoning and detailed analysis.' },
    { name: 'Llama 3', icon: '🚀', description: 'Fastest and most private, for quick thoughts.' },
  ];

  const handleSelectModel = (modelName) => {
    setSelectedModel(modelName);
    setIsOpen(false);
    // You would add logic here to pass the selected model up to a parent component
    // or set a global state for Sage to use.
  };

  const popoverVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 10, scale: 0.95 },
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg ${theme.glass} hover:bg-white/20 border transition-colors`}
        title="Select AI Model"
      >
        <span className="text-sm">🧠</span>
        <span className="font-medium">{selectedModel}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          ▼
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={popoverVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            className={`absolute bottom-full mb-2 w-64 p-2 rounded-xl border ${theme.glass} shadow-xl backdrop-blur-md z-50`}
          >
            <div className="flex flex-col gap-1">
              {models.map((model) => (
                <button
                  key={model.name}
                  onClick={() => handleSelectModel(model.name)}
                  className={`flex flex-col items-start p-3 rounded-lg text-left transition-colors ${
                    selectedModel === model.name ? `bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg` : `${theme.text.primary} hover:bg-white/10`
                  }`}
                >
                  <span className="flex items-center gap-2 font-semibold">
                    <span className="text-lg">{model.icon}</span>
                    {model.name}
                  </span>
                  <p className={`text-xs mt-1 ${selectedModel === model.name ? 'text-indigo-100' : theme.text.secondary}`}>
                    {model.description}
                  </p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModelSelector;
