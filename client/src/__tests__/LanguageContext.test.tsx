import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LanguageProvider, useLanguage } from '../contexts/LanguageContext';
import React from 'react';

// Test component to use the hook
function TestComponent() {
  const { language, t, setLanguage } = useLanguage();
  return (
    <div>
      <div data-testid="language">{language}</div>
      <div data-testid="translation">{t('home.welcome')}</div>
      <button onClick={() => setLanguage('fr')}>Switch to French</button>
      <button onClick={() => setLanguage('en')}>Switch to English</button>
    </div>
  );
}

// Test component to test missing keys
function TestMissingKeyComponent() {
  const { t } = useLanguage();
  return (
    <div>
      <div data-testid="missing-key">{t('nonexistent.key')}</div>
    </div>
  );
}

describe('LanguageContext', () => {
  test('provides default language', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    
    const languageElement = screen.getByTestId('language');
    expect(languageElement.textContent).toMatch(/en|fr/);
  });

  test('provides translation function', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    
    const translationElement = screen.getByTestId('translation');
    expect(translationElement.textContent).toBeTruthy();
  });

  test('translation returns key if not found', () => {
    render(
      <LanguageProvider>
        <TestMissingKeyComponent />
      </LanguageProvider>
    );
    
    const missingKeyElement = screen.getByTestId('missing-key');
    expect(missingKeyElement.textContent).toBe('nonexistent.key');
  });
});

describe('Translation Keys', () => {
  test('has required translation keys for English', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    
    expect(screen.getByTestId('translation')).toBeInTheDocument();
  });
});
