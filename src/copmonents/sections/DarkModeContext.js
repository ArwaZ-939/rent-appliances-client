import React, { createContext, useState, useEffect } from 'react';


export const DarkModeContext = createContext();


export const DarkModeProvider = ({ children }) => {
  
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('darkMode');
      return saved === 'true';
    } catch {
      return false;
    }
  });


  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // دالة لتبديل الوضع الليلي
  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <div
        className={darkMode ? 'bg-dark text-light' : 'bg-light text-dark'}
        style={{ minHeight: '100vh' }}
      >
        {children}
      </div>
    </DarkModeContext.Provider>
  );
};
