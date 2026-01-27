import { useLanguageStore } from '@/stores/languageStore';
import { fr } from '@/locales/fr';
import { ar } from '@/locales/ar';

const translations = {
  fr,
  ar,
};

export const useTranslation = () => {
  const language = useLanguageStore((state) => state.language);

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        console.warn(`Translation key "${key}" not found for language "${language}"`);
        return key;
      }
    }

    // Handle placeholders like {amount}
    return typeof value === 'string' ? value : String(value);
  };

  const tWithParams = (key: string, params: Record<string, string | number>): string => {
    let translated = t(key);
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      translated = translated.replace(`{${paramKey}}`, String(paramValue));
    });
    return translated;
  };

  return { t, tWithParams, language };
};

