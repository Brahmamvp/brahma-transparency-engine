// src/context/SageChatContext.jsx

import React, { createContext, useContext } from "react";

// Default context with a warning for when it's not fully initialized
const defaultContext = {
  sendMessageToSage: (msg) => console.warn("SageChatContext not fully initialized. Message sent:", msg),
};

export const SageChatContext = createContext(defaultContext);

// The provider must accept the real send function from a parent component (likely the parent of SageChat.jsx)
export const SageChatProvider = ({ children, sendMessageOverride }) => {
  const contextValue = {
    // Expose the real sending function if provided, otherwise use the default noop/warning
    sendMessageToSage: sendMessageOverride || defaultContext.sendMessageToSage,
  };

  return (
    <SageChatContext.Provider value={contextValue}>
      {children}
    </SageChatContext.Provider>
  );
};

export const useSageChatContext = () => useContext(SageChatContext);
