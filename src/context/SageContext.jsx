// /src/context/SageContext.js
import React, { createContext, useContext, useReducer } from 'react';
import { SessionMemory } from '../utils/sessionMemory';

const SageContext = createContext();

const sageReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
        isTyping: false
      };
    case 'SET_TYPING':
      return { ...state, isTyping: action.payload };
    case 'SET_ACTIVE_CARD':
      return { ...state, activeCard: action.payload };
    case 'UPDATE_CONTEXT':
      return {
        ...state,
        conversationContext: { ...state.conversationContext, ...action.payload }
      };
    default:
      return state;
  }
};

export const SageProvider = ({ children }) => {
  const [state, dispatch] = useReducer(sageReducer, {
    messages: [
      { role: 'sage', text: "Hi, I'm Sage. I'm here to help you explore decisions without pressure. What's on your mind?" }
    ],
    isTyping: false,
    activeCard: null,
    conversationContext: {
      topics: [],
      sentiment: 'neutral',
      decisionStage: 'exploring'
    },
    sessionMemory: new SessionMemory()
  });

  return (
    <SageContext.Provider value={{ state, dispatch }}>
      {children}
    </SageContext.Provider>
  );
};

export const useSage = () => {
  const context = useContext(SageContext);
  if (!context) {
    throw new Error('useSage must be used within SageProvider');
  }
  return context;
};
