import React from 'react';
import { useTranslation, type Language } from '@/utils/i18n';

interface LanguageSelectorProps {
  className?: string;
  showLabels?: boolean;
  compact?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className = '',
  showLabels = true,
  compact = false
}) => {
  const { language, setLanguage, availableLanguages, languageNames } = useTranslation();

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {availableLanguages.map((lang) => (
          <button
            key={lang}
            onClick={() => handleLanguageChange(lang)}
            className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
              language === lang
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title={languageNames[lang]}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showLabels && (
        <span className="text-sm text-gray-600">Sprache:</span>
      )}
      
      <div className="flex bg-gray-100 rounded-lg p-1">
        {availableLanguages.map((lang) => (
          <button
            key={lang}
            onClick={() => handleLanguageChange(lang)}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${
              language === lang
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            {showLabels ? languageNames[lang] : lang.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
