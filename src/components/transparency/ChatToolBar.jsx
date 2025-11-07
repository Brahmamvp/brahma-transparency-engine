import React from 'react';
import { motion } from 'framer-motion';
import { themes } from '../../styles/themes'; // make sure this path is correct

const ChatTools = ({ theme }) => {
  // Always fall back to "dark" theme if none provided
  const safeTheme = theme || themes.dark;

  // Placeholder for context-aware logic
  const getDynamicTools = () => {
    const tools = [
      { name: 'Summarize', icon: '📝', action: () => console.log('Summarize action') },
      { name: 'Pros & Cons', icon: '⚖️', action: () => console.log('Pros & Cons action') },
      { name: 'Visualize Data', icon: '📊', action: () => console.log('Visualize Data action') },
    ];
    return tools;
  };

  const tools = getDynamicTools();

  return (
    <div className={`p-2 rounded-xl border ${safeTheme.glass} shadow-lg backdrop-blur-md z-40`}>
      <div className="flex gap-2 justify-center">
        {tools.map((tool, index) => (
          <motion.button
            key={index}
            onClick={tool.action}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${safeTheme.glass} hover:bg-white/10 border`}
          >
            <span className="text-sm">{tool.icon}</span>
            <span className="font-medium hidden sm:inline">{tool.name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default ChatTools;