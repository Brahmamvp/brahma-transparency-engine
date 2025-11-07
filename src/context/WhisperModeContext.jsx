// src/context/WhisperModeContext.jsx
import React, { createContext, useContext, useState } from 'react';

const WhisperModeContext = createContext();

export const useWhisperMode = () => useContext(WhisperModeContext);

export const WhisperModeProvider = ({ children }) => {
  const [isWhispering, setIsWhispering] = useState(false);

  const toggleWhisper = () => setIsWhispering(prev => !prev);
  const enableWhisper = () => setIsWhispering(true);
  const disableWhisper = () => setIsWhispering(false);

  return (
    <WhisperModeContext.Provider value={{ isWhispering, toggleWhisper, enableWhisper, disableWhisper }}>
      {children}
    </WhisperModeContext.Provider>
  );
};