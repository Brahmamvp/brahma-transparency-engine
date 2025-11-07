// /src/context/UserPreferencesContext.js
import React, { createContext, useContext, useState } from 'react';

const UserPreferencesContext = createContext();

export const UserPreferencesProvider = ({ children }) => {
  const [assumptions, setAssumptions] = useState({
    riskTolerance: 'moderate',
    timeline: 'flexible'
  });

  const [lensSettings, setLensSettings] = useState({
    financial: true,
    emotional: true,
    lifestyle: true,
    familyImpact: false,
    careerGrowth: true
  });

  return (
    <UserPreferencesContext.Provider value={{
      assumptions,
      setAssumptions,
      lensSettings,
      setLensSettings
    }}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('useUserPreferences must be used within UserPreferencesProvider');
  }
  return context;
};
