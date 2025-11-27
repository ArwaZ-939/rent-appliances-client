import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from './LanguageContext';

const LanguageSwitcher = () => {
  const { currentLanguage, changeLanguage } = useLanguage();

  return (
    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
      <button
        onClick={() => changeLanguage('en')}
        className={`btn btn-sm ${currentLanguage === 'en' ? 'btn-primary' : 'btn-outline-secondary'}`}
        style={{
          padding: '5px 10px',
          fontSize: '12px',
          borderRadius: '5px',
          border: '1px solid',
          cursor: 'pointer'
        }}
        title="English"
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('ar')}
        className={`btn btn-sm ${currentLanguage === 'ar' ? 'btn-primary' : 'btn-outline-secondary'}`}
        style={{
          padding: '5px 10px',
          fontSize: '12px',
          borderRadius: '5px',
          border: '1px solid',
          cursor: 'pointer'
        }}
        title="العربية"
      >
        AR
      </button>
    </div>
  );
};

export default LanguageSwitcher;

