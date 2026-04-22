import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import deTranslation from "./locales/de/translation.json";
import enTranslation from "./locales/en/translation.json";

i18n.use(LanguageDetector).use(initReactI18next).init({
    resources: {
        de: { translation: deTranslation },
        en: { translation: enTranslation },
    },
    fallbackLng: "de",
    supportedLngs: ["de", "en"],
    interpolation: {
        escapeValue: false,
    },
    detection: {
        order: ["querystring", "cookie", "localStorage", "navigator", "htmlTag"],
        lookupQuerystring: "lng",
        lookupCookie: "i18next",
        lookupLocalStorage: "i18nextLng",
    },
});

export default i18n;
