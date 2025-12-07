import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from './LanguageContext';

const LanguageSwitcher = () => {
  const { currentLanguage, changeLanguage } = useLanguage();

  return (
    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
      <button
        onClick={() => changeLanguage('en')}
        style={{
          padding: '5px 10px',
          fontSize: '12px',
          borderRadius: '5px',
          border: '1px solid #7B4F2C',
          cursor: 'pointer',
          backgroundColor: currentLanguage === 'en' ? '#7B4F2C' : 'transparent',
          color: currentLanguage === 'en' ? 'white' : '#7B4F2C',
          fontWeight: '500',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          if (currentLanguage !== 'en') {
            e.target.style.backgroundColor = '#7B4F2C';
            e.target.style.color = 'white';
          }
        }}
        onMouseLeave={(e) => {
          if (currentLanguage !== 'en') {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#7B4F2C';
          }
        }}
        title="English"
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('ar')}
        style={{
          padding: '5px 10px',
          fontSize: '12px',
          borderRadius: '5px',
          border: '1px solid #7B4F2C',
          cursor: 'pointer',
          backgroundColor: currentLanguage === 'ar' ? '#7B4F2C' : 'transparent',
          color: currentLanguage === 'ar' ? 'white' : '#7B4F2C',
          fontWeight: '500',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          if (currentLanguage !== 'ar') {
            e.target.style.backgroundColor = '#7B4F2C';
            e.target.style.color = 'white';
          }
        }}
        onMouseLeave={(e) => {
          if (currentLanguage !== 'ar') {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#7B4F2C';
          }
        }}
        title="العربية"
      >
        AR
      </button>
    </div>
  );
};

export default LanguageSwitcher;

