import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from '../../i18n/config';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const savedLanguage = localStorage.getItem('i18nextLng') || (i18n.language || 'en');
  const [currentLanguage, setCurrentLanguage] = useState(savedLanguage);

  // Initialize language and direction on mount
  useEffect(() => {
    const lang = savedLanguage || 'en';
    // Wait a bit for i18n to initialize if needed
    const timer = setTimeout(() => {
      if (i18n.isInitialized) {
        i18n.changeLanguage(lang);
      }
    }, 0);
    
    setCurrentLanguage(lang);
    
    // Set initial direction
    if (lang === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
    }
    
    return () => clearTimeout(timer);
  }, []);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setCurrentLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
    // Update document direction for RTL languages
    if (lang === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
    }
  };

  const toggleLanguage = () => {
    const newLang = currentLanguage === 'en' ? 'ar' : 'en';
    changeLanguage(newLang);
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

