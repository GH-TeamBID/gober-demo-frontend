import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Cookies from 'js-cookie';

// Import common translations
import enCommon from './locales/en/common.json';
import esCommon from './locales/es/common.json';

// Import header translations
import enHeader from './locales/en/header.json';
import esHeader from './locales/es/header.json';

// Import auth translations
import enAuth from './locales/en/auth.json';
import esAuth from './locales/es/auth.json';

// Import errors translations
import enErrors from './locales/en/errors.json';
import esErrors from './locales/es/errors.json';

// Import settings translations
import enSettings from './locales/en/settings.json';
import esSettings from './locales/es/settings.json';

// Import tenders translations
import enTenders from './locales/en/tenders.json';
import esTenders from './locales/es/tenders.json';

// Import UI translations
import enUI from './locales/en/ui.json';
import esUI from './locales/es/ui.json';

// Initialize i18next
i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources: {
      en: {
        common: enCommon,
        header: enHeader,
        auth: enAuth,
        errors: enErrors,
        settings: enSettings,
        tenders: enTenders,
        ui: enUI
      },
      es: {
        common: esCommon,
        header: esHeader,
        auth: esAuth,
        errors: esErrors,
        settings: esSettings,
        tenders: esTenders,
        ui: esUI
      }
    },
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    ns: ['common', 'header', 'auth', 'errors', 'settings', 'tenders', 'ui'],
    defaultNS: 'common',
    
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
    
    detection: {
      order: ['cookie', 'querystring', 'navigator', 'localStorage', 'htmlTag'],
      lookupQuerystring: 'lng',
      lookupCookie: 'i18next',
      caches: ['cookie'],
      cookieOptions: {
        expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 year from now
        path: '/',
        sameSite: 'strict'
      }
    },

    // React settings
    react: {
      useSuspense: true,
    }
  });

// Add language change listener to update cookie when language changes
i18n.on('languageChanged', (lng) => {
  Cookies.set('i18next', lng, { 
    expires: 365, // 1 year
    path: '/',
    sameSite: 'strict'
  });
});

export default i18n; 