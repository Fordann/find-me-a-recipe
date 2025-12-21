import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider, useDispatch } from 'react-redux';
import { store } from '../store/store';
import { switched } from '../store/slices/language/LanguageSlice';
import { useTranslation } from '../store/slices/language/LanguageExtension';

// Component exercising the translation hook and toggle action
const TestTranslationComponent = () => {
  const t = useTranslation();
  const dispatch = useDispatch();

  return (
    <div>
      <div data-testid="welcome">{t('home.welcome')}</div>
      <div data-testid="missing">{t('nonexistent.key')}</div>
      <button data-testid="toggle" onClick={() => dispatch(switched())}>
        toggle
      </button>
    </div>
  );
};

describe('useTranslation (Redux)', () => {
  test('returns French by default and falls back to key when missing', () => {
    render(
      <Provider store={store}>
        <TestTranslationComponent />
      </Provider>
    );

    expect(screen.getByTestId('welcome')).toHaveTextContent('Bienvenue sur Find Me a Recipe');
    expect(screen.getByTestId('missing')).toHaveTextContent('nonexistent.key');
  });

  test('toggles language when dispatching switched', () => {
    render(
      <Provider store={store}>
        <TestTranslationComponent />
      </Provider>
    );

    fireEvent.click(screen.getByTestId('toggle'));

    expect(screen.getByTestId('welcome')).toHaveTextContent('Welcome to Find Me a Recipe');
  });
});
