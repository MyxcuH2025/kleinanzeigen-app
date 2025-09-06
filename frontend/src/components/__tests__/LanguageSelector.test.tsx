import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock i18n utilities
jest.mock('@/utils/i18n', () => ({
  useTranslation: jest.fn(),
}));

import LanguageSelector from '../LanguageSelector';
import { useTranslation } from '@/utils/i18n';
import type { Language } from '@/utils/i18n';

describe('LanguageSelector', () => {
  const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;
  
  const defaultMockData = {
    t: jest.fn((key: string) => key),
    language: 'de' as Language,
    setLanguage: jest.fn(),
    availableLanguages: ['de', 'en', 'ru'] as Language[],
    languageNames: {
      de: 'Deutsch',
      en: 'English',
      ru: 'Русский'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTranslation.mockReturnValue(defaultMockData);
  });

  it('renders with default props', () => {
    render(<LanguageSelector />);
    
    expect(screen.getByText('Sprache:')).toBeInTheDocument();
    expect(screen.getByText('Deutsch')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Русский')).toBeInTheDocument();
  });

  it('renders without labels when showLabels is false', () => {
    render(<LanguageSelector showLabels={false} />);
    
    expect(screen.queryByText('Sprache:')).not.toBeInTheDocument();
    expect(screen.getByText('DE')).toBeInTheDocument();
    expect(screen.getByText('EN')).toBeInTheDocument();
    expect(screen.getByText('RU')).toBeInTheDocument();
  });

  it('renders in compact mode', () => {
    render(<LanguageSelector compact={true} />);
    
    expect(screen.queryByText('Sprache:')).not.toBeInTheDocument();
    expect(screen.getByText('DE')).toBeInTheDocument();
    expect(screen.getByText('EN')).toBeInTheDocument();
    expect(screen.getByText('RU')).toBeInTheDocument();
  });

  it('calls setLanguage when language button is clicked', () => {
    render(<LanguageSelector />);
    
    const englishButton = screen.getByText('English');
    fireEvent.click(englishButton);
    
    expect(defaultMockData.setLanguage).toHaveBeenCalledWith('en');
  });

  it('calls setLanguage in compact mode', () => {
    render(<LanguageSelector compact={true} />);
    
    const englishButton = screen.getByText('EN');
    fireEvent.click(englishButton);
    
    expect(defaultMockData.setLanguage).toHaveBeenCalledWith('en');
  });

  it('applies custom className', () => {
    render(<LanguageSelector className="custom-class" />);
    
    // Find the outermost container with the custom class
    const container = screen.getByText('Sprache:').closest('div');
    expect(container).toHaveClass('custom-class');
  });

  it('applies custom className in compact mode', () => {
    render(<LanguageSelector compact={true} className="custom-compact" />);
    
    const container = screen.getByText('DE').closest('div');
    expect(container).toHaveClass('custom-compact');
  });

  it('highlights current language correctly', () => {
    render(<LanguageSelector />);
    
    const currentLanguageButton = screen.getByText('Deutsch');
    const otherLanguageButton = screen.getByText('English');
    
    // The current language should have different styling
    expect(currentLanguageButton).toHaveClass('bg-white', 'text-blue-600', 'shadow-sm');
    expect(otherLanguageButton).toHaveClass('text-gray-600');
  });

  it('highlights current language in compact mode', () => {
    render(<LanguageSelector compact={true} />);
    
    const currentLanguageButton = screen.getByText('DE');
    const otherLanguageButton = screen.getByText('EN');
    
    // The current language should have different styling
    expect(currentLanguageButton).toHaveClass('bg-blue-600', 'text-white');
    expect(otherLanguageButton).toHaveClass('bg-gray-100', 'text-gray-700');
  });

  it('renders all available languages', () => {
    render(<LanguageSelector />);
    
    expect(screen.getByText('Deutsch')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Русский')).toBeInTheDocument();
  });

  it('renders all available languages in compact mode', () => {
    render(<LanguageSelector compact={true} />);
    
    expect(screen.getByText('DE')).toBeInTheDocument();
    expect(screen.getByText('EN')).toBeInTheDocument();
    expect(screen.getByText('RU')).toBeInTheDocument();
  });

  it('handles different language sets', () => {
    const customMockData = {
      ...defaultMockData,
      availableLanguages: ['de', 'en'] as Language[],
      languageNames: {
        de: 'Deutsch',
        en: 'English',
        ru: 'Русский'
      }
    };
    mockUseTranslation.mockReturnValue(customMockData);
    
    render(<LanguageSelector />);
    
    expect(screen.getByText('Deutsch')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.queryByText('Русский')).not.toBeInTheDocument();
  });

  it('handles different language sets in compact mode', () => {
    const customMockData = {
      ...defaultMockData,
      availableLanguages: ['de', 'en'] as Language[],
      languageNames: {
        de: 'Deutsch',
        en: 'English',
        ru: 'Русский'
      }
    };
    mockUseTranslation.mockReturnValue(customMockData);
    
    render(<LanguageSelector compact={true} />);
    
    expect(screen.getByText('DE')).toBeInTheDocument();
    expect(screen.getByText('EN')).toBeInTheDocument();
    expect(screen.queryByText('RU')).not.toBeInTheDocument();
  });

  it('shows tooltips in compact mode', () => {
    render(<LanguageSelector compact={true} />);
    
    const germanButton = screen.getByText('DE');
    expect(germanButton).toHaveAttribute('title', 'Deutsch');
    
    const englishButton = screen.getByText('EN');
    expect(englishButton).toHaveAttribute('title', 'English');
  });

  it('handles empty language list gracefully', () => {
    const emptyMockData = {
      ...defaultMockData,
      availableLanguages: [] as Language[],
      languageNames: {
        de: 'Deutsch',
        en: 'English',
        ru: 'Русский'
      }
    };
    mockUseTranslation.mockReturnValue(emptyMockData);
    
    render(<LanguageSelector />);
    
    expect(screen.getByText('Sprache:')).toBeInTheDocument();
    // Should render without errors even with no languages
  });

  it('handles single language gracefully', () => {
    const singleMockData = {
      ...defaultMockData,
      availableLanguages: ['de'] as Language[],
      languageNames: {
        de: 'Deutsch',
        en: 'English',
        ru: 'Русский'
      }
    };
    mockUseTranslation.mockReturnValue(singleMockData);
    
    render(<LanguageSelector />);
    
    expect(screen.getByText('Deutsch')).toBeInTheDocument();
    expect(screen.queryByText('English')).not.toBeInTheDocument();
  });

  it('maintains button order based on availableLanguages array', () => {
    render(<LanguageSelector />);
    
    const buttons = screen.getAllByRole('button');
    const buttonTexts = buttons.map(button => button.textContent);
    
    // Should maintain the order from availableLanguages
    expect(buttonTexts).toEqual(['Deutsch', 'English', 'Русский']);
  });

  it('maintains button order in compact mode', () => {
    render(<LanguageSelector compact={true} />);
    
    const buttons = screen.getAllByRole('button');
    const buttonTexts = buttons.map(button => button.textContent);
    
    // Should maintain the order from availableLanguages
    expect(buttonTexts).toEqual(['DE', 'EN', 'RU']);
  });
});
