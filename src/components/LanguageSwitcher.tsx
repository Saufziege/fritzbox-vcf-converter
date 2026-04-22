import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const currentLanguage = i18n.language.startsWith("de") ? "de" : "en";

  return (
    <div className="mt-6 flex justify-center gap-2">
      {(["de", "en"] as const).map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => void i18n.changeLanguage(lang)}
          className={`btn btn-sm ${currentLanguage === lang ? "btn-active" : "btn-secondary"}`}
        >
          {t(`languageSwitcher.${lang}`)}
        </button>
      ))}
    </div>
  );
}
