import { useLanguageStore } from '@/stores/languageStore';

export interface MultilingualText {
  fr: string;
  ar: string;
}

/**
 * Get the text in the current language, with fallback to French if not available
 */
export const getLocalizedText = (text: MultilingualText | string | undefined | null): string => {
  if (!text) return '';
  
  // If it's already a string (backward compatibility), return it
  if (typeof text === 'string') {
    return text;
  }
  
  // If it's a multilingual object
  if (typeof text === 'object' && 'fr' in text && 'ar' in text) {
    const language = useLanguageStore.getState().language;
    const localized = text[language as keyof MultilingualText];
    
    // Fallback to French if the current language is not available
    return localized || text.fr || text.ar || '';
  }
  
  return '';
};

/**
 * Hook version that updates when language changes
 */
export const useLocalizedText = (text: MultilingualText | string | undefined | null): string => {
  const language = useLanguageStore((state) => state.language);
  
  if (!text) return '';
  
  // If it's already a string (backward compatibility), return it
  if (typeof text === 'string') {
    return text;
  }
  
  // If it's a multilingual object
  if (typeof text === 'object' && 'fr' in text && 'ar' in text) {
    const localized = text[language as keyof MultilingualText];
    
    // Fallback to French if the current language is not available
    return localized || text.fr || text.ar || '';
  }
  
  return '';
};

