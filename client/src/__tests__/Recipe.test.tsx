import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LanguageProvider } from '../contexts/LanguageContext';
import Recipe from '../components/Recipe';

const mockRecipe = {
  name: 'Test Recipe',
  image: 'https://example.com/image.jpg',
  rate: '4.5',
  budget: '€',
  prep_time: '15 min',
  cook_time: '30 min',
  total_time: '45 min',
  difficulty: 'Facile',
  recipe_quantity: '4 personnes',
  nb_comments: 10,
  ingredients: [
    ['200', 'g', 'farine'] as [string, string, string],
    ['2', '', 'oeufs'] as [string, string, string],
    'sel'
  ] as (string | [string, string, string])[],
  steps: [
    'Mélanger la farine et les oeufs',
    'Ajouter le sel',
    'Cuire pendant 30 minutes'
  ]
};

describe('Recipe Component', () => {
  const renderWithLanguage = (component: React.ReactElement) => {
    return render(
      <LanguageProvider>
        {component}
      </LanguageProvider>
    );
  };

  test('renders recipe name', () => {
    renderWithLanguage(<Recipe value={mockRecipe} onBack={() => {}} />);
    expect(screen.getByText('Test Recipe')).toBeInTheDocument();
  });

  test('renders recipe metadata', () => {
    renderWithLanguage(<Recipe value={mockRecipe} onBack={() => {}} />);
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('4 personnes')).toBeInTheDocument();
  });

  test('renders preparation times', () => {
    renderWithLanguage(<Recipe value={mockRecipe} onBack={() => {}} />);
    expect(screen.getByText('15 min')).toBeInTheDocument();
    expect(screen.getByText('30 min')).toBeInTheDocument();
  });

  test('renders with no onBack callback', () => {
    renderWithLanguage(<Recipe value={mockRecipe} />);
    expect(screen.getByText('Test Recipe')).toBeInTheDocument();
  });
});
