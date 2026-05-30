import React, { createContext, useContext, useState } from 'react';

const PreferencesContext = createContext();

export const PreferencesProvider = ({ children }) => {
  const [isCelsius, setIsCelsius] = useState(() => localStorage.getItem('tempUnit') !== 'F');

  const toggleTemperatureUnit = () => {
    setIsCelsius((prev) => {
      localStorage.setItem('tempUnit', prev ? 'F' : 'C');
      return !prev;
    });
  };

  return (
    <PreferencesContext.Provider value={{ isCelsius, toggleTemperatureUnit }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => useContext(PreferencesContext);
