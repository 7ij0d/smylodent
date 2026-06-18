import React, { createContext, useState, useEffect, useContext } from 'react';
import ar from '../translations/ar.json';
import en from '../translations/en.json';

const LanguageContext = createContext();

const dictionaries = { ar, en };

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('smylodent_lang') || 'ar'; // Default to Arabic (Libya market primary)
  });

  useEffect(() => {
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', dir);
    localStorage.setItem('smylodent_lang', lang);
  }, [lang]);

  const dictionary = dictionaries[lang];

  // Dot-notation key search and variable replacement
  const t = (keyPath, variables = {}) => {
    const keys = keyPath.split('.');
    let value = dictionary;

    for (const key of keys) {
      if (value && value[key] !== undefined) {
        value = value[key];
      } else {
        return keyPath; // fallback to key path if translation missing
      }
    }

    if (typeof value !== 'string') return keyPath;

    let translatedString = value;
    Object.entries(variables).forEach(([vKey, vVal]) => {
      translatedString = translatedString.replace(new RegExp(`\\{${vKey}\\}`, 'g'), vVal);
    });

    return translatedString;
  };

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t, isRtl: lang === 'ar' }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
