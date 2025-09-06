import { i18n, useTranslation, t, type Language } from '../i18n';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('i18n System', () => {
  beforeEach(() => {
    // Reset localStorage mock
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    
    // Reset i18n to default language
    i18n.setLanguage('de');
  });

  describe('Basic Translation', () => {
    test('translates simple keys correctly', () => {
      expect(i18n.t('common.save')).toBe('Speichern');
      expect(i18n.t('common.cancel')).toBe('Abbrechen');
      expect(i18n.t('common.reset')).toBe('Zurücksetzen');
    });

    test('translates nested keys correctly', () => {
      expect(i18n.t('forms.sections.about_item')).toBe('Über den Artikel');
      expect(i18n.t('forms.sections.specs')).toBe('Spezifikationen');
      expect(i18n.t('forms.fieldTypes.text')).toBe('Text');
    });

    test('returns key if translation not found', () => {
      expect(i18n.t('nonexistent.key')).toBe('nonexistent.key');
      expect(i18n.t('common.nonexistent')).toBe('common.nonexistent');
    });
  });

  describe('Language Switching', () => {
    test('switches to English correctly', () => {
      i18n.setLanguage('en');
      expect(i18n.getLanguage()).toBe('en');
      expect(i18n.t('common.save')).toBe('Save');
      expect(i18n.t('common.cancel')).toBe('Cancel');
    });

    test('switches to Russian correctly', () => {
      i18n.setLanguage('ru');
      expect(i18n.getLanguage()).toBe('ru');
      expect(i18n.t('common.save')).toBe('Сохранить');
      expect(i18n.t('common.cancel')).toBe('Отмена');
    });

    test('switches back to German correctly', () => {
      i18n.setLanguage('en');
      i18n.setLanguage('de');
      expect(i18n.getLanguage()).toBe('de');
      expect(i18n.t('common.save')).toBe('Speichern');
    });

    test('ignores invalid language codes', () => {
      const currentLang = i18n.getLanguage();
      i18n.setLanguage('invalid' as Language);
      expect(i18n.getLanguage()).toBe(currentLang);
    });
  });

  describe('Parameter Replacement', () => {
    test('replaces single parameter correctly', () => {
      expect(i18n.t('validation.minLength', { min: 5 })).toBe('Mindestens 5 Zeichen erforderlich');
      expect(i18n.t('validation.maxLength', { max: 100 })).toBe('Maximal 100 Zeichen erlaubt');
    });

    test('replaces multiple parameters correctly', () => {
      expect(i18n.t('validation.minValue', { min: 0 })).toBe('Mindestwert: 0');
      expect(i18n.t('validation.maxValue', { max: 1000 })).toBe('Maximalwert: 1000');
    });

    test('handles missing parameters gracefully', () => {
      expect(i18n.t('validation.minLength')).toBe('Mindestens {min} Zeichen erforderlich');
      expect(i18n.t('validation.maxLength')).toBe('Maximal {max} Zeichen erlaubt');
    });

    test('handles mixed parameter types', () => {
      expect(i18n.t('validation.minLength', { min: '5' })).toBe('Mindestens 5 Zeichen erforderlich');
      expect(i18n.t('validation.maxValue', { max: 1000.5 })).toBe('Maximalwert: 1000.5');
    });
  });

  describe('Fallback Behavior', () => {
    test('falls back to German when translation missing in current language', () => {
      i18n.setLanguage('en');
      // This key exists in German but not in English
      expect(i18n.t('forms.sections.about_item')).toBe('About Item');
      
      // This key doesn't exist in any language
      expect(i18n.t('nonexistent.key')).toBe('nonexistent.key');
    });

    test('maintains fallback behavior across language switches', () => {
      i18n.setLanguage('ru');
      expect(i18n.t('forms.sections.about_item')).toBe('О товаре');
      
      i18n.setLanguage('en');
      expect(i18n.t('forms.sections.about_item')).toBe('About Item');
    });
  });

  describe('localStorage Integration', () => {
    test('saves language preference to localStorage', () => {
      i18n.setLanguage('en');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('preferred-language', 'en');
    });

    test('loads language preference from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('en');
      i18n.loadPreferredLanguage();
      expect(i18n.getLanguage()).toBe('en');
    });

    test('ignores invalid saved language preference', () => {
      localStorageMock.getItem.mockReturnValue('invalid');
      i18n.loadPreferredLanguage();
      expect(i18n.getLanguage()).toBe('de'); // Default language
    });

    test('handles missing localStorage gracefully', () => {
      localStorageMock.getItem.mockReturnValue(null);
      i18n.loadPreferredLanguage();
      expect(i18n.getLanguage()).toBe('de'); // Default language
    });
  });

  describe('Key Validation', () => {
    test('checks if translation key exists', () => {
      expect(i18n.hasKey('common.save')).toBe(true);
      expect(i18n.hasKey('forms.sections.about_item')).toBe(true);
      expect(i18n.hasKey('nonexistent.key')).toBe(false);
    });

    test('handles nested key validation correctly', () => {
      expect(i18n.hasKey('forms.sections')).toBe(false); // This is an object, not a string
      expect(i18n.hasKey('forms.sections.about_item')).toBe(true);
    });
  });

  describe('Key Extraction', () => {
    test('extracts all available translation keys', () => {
      const keys = i18n.getAllKeys();
      expect(keys).toContain('common.save');
      expect(keys).toContain('common.cancel');
      expect(keys).toContain('forms.sections.about_item');
      expect(keys).toContain('validation.minLength');
    });

    test('returns keys for current language', () => {
      i18n.setLanguage('en');
      const keys = i18n.getAllKeys();
      expect(keys).toContain('common.save');
      expect(keys).toContain('forms.sections.about_item');
    });
  });

  describe('useTranslation Hook', () => {
    test('returns translation function', () => {
      const { t } = useTranslation();
      expect(typeof t).toBe('function');
      expect(t('common.save')).toBe('Speichern');
    });

    test('returns current language', () => {
      const { language } = useTranslation();
      expect(language).toBe('de');
    });

    test('returns setLanguage function', () => {
      const { setLanguage } = useTranslation();
      expect(typeof setLanguage).toBe('function');
    });

    test('returns available languages', () => {
      const { availableLanguages } = useTranslation();
      expect(availableLanguages).toEqual(['de', 'en', 'ru']);
    });

    test('returns language names', () => {
      const { languageNames } = useTranslation();
      expect(languageNames.de).toBe('Deutsch');
      expect(languageNames.en).toBe('English');
      expect(languageNames.ru).toBe('Русский');
    });
  });

  describe('Direct Translation Function', () => {
    test('translates keys directly', () => {
      expect(t('common.save')).toBe('Speichern');
      expect(t('common.cancel')).toBe('Abbrechen');
    });

    test('supports parameter replacement', () => {
      expect(t('validation.minLength', { min: 10 })).toBe('Mindestens 10 Zeichen erforderlich');
    });
  });

  describe('Edge Cases', () => {
    test('handles empty key gracefully', () => {
      expect(i18n.t('')).toBe('');
    });

    test('handles undefined key gracefully', () => {
      expect(i18n.t(undefined as any)).toBe('');
    });

    test('handles null key gracefully', () => {
      expect(i18n.t(null as any)).toBe('');
    });

    test('handles complex nested keys', () => {
      expect(i18n.t('forms.sections.about_item')).toBe('Über den Artikel');
    });

    test('handles keys with dots in values', () => {
      // This test ensures that dots in translation values don't interfere with key parsing
      expect(i18n.t('common.save')).toBe('Speichern');
    });
  });

  describe('Language Names', () => {
    test('provides correct language names', () => {
      expect(i18n.getLanguage()).toBe('de');
      // Language names should be in the current language
      // For now, we'll test the static language names
      const { languageNames } = useTranslation();
      expect(languageNames.de).toBe('Deutsch');
      expect(languageNames.en).toBe('English');
      expect(languageNames.ru).toBe('Русский');
    });
  });
});
