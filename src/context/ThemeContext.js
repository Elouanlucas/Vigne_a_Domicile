import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Charger le thème depuis localStorage au démarrage
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  // Sauvegarder le thème dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Au chargement, on applique la classe sur le body
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};