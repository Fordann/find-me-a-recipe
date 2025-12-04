import React, { createContext, useContext, useState, useEffect } from 'react';
import { recipeCache } from '../utils/recipeCache';

type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Home page
    'home.welcome': 'Welcome to Find Me a Recipe',
    'home.subtitle': 'Discover delicious recipes with your ingredients',
    'home.start': 'Get Started',
    
    // Search
    'search.hero': 'Type a recipe or an ingredient',
    'search.placeholder.tomato': 'tomato',
    'search.placeholder.tuna': 'tuna',
    'search.placeholder.feta': 'feta',
    'search.placeholder.chicken': 'chicken',
    'search.placeholder.avocado': 'avocado',
    'search.placeholder.pepper': 'pepper',
    'search.placeholder.zucchini': 'zucchini',
    'search.placeholder.parmesan': 'parmesan',
    'search.placeholder.basil': 'basil',
    'search.placeholder.salmon': 'salmon',
    'search.placeholder.lemon': 'lemon',
    'search.placeholder.dill': 'dill',
    'search.placeholder.pasta': 'pasta alla vodka',
    'search.placeholder.tiramisu': 'tiramisu',
    'search.placeholder.ramen': 'ramen',
    'search.placeholder.dahl': 'dahl',
    'search.placeholder.tacos': 'tacos',
    'search.placeholder.curry': 'green curry',
    
    // Favorites
    'favorites.title': 'My Favorites',
    'favorites.empty': 'No favorites yet',
    'favorites.emptyHint': 'Swipe right to add recipes!',
    'favorites.add': 'Add to favorites',
    'favorites.remove': 'Remove from favorites',
    'favorites.added': 'Added to favorites',
    'favorites.removed': 'Removed from favorites',
    
    // Recipe
    'recipe.back': 'Back',
    'recipe.quantity': 'Quantity',
    'recipe.totalTime': 'Total time',
    'recipe.rating': 'Rating',
    'recipe.prep': 'Prep',
    'recipe.cook': 'Cook',
    'recipe.swipeSteps': 'Swipe to see steps',
    'recipe.swipeBack': 'Swipe to go back',
    'recipe.ingredients': 'Ingredients',
    'recipe.servings': 'servings',
    'recipe.decrease': 'Decrease',
    'recipe.increase': 'Increase',
    'recipe.checkIngredient': 'Check ingredient',
    'recipe.preparationSteps': 'Preparation steps',
    'recipe.hideCompleted': 'Hide completed',
    'recipe.showCompleted': 'Show {count} completed',
    'recipe.scrollDown': 'Scroll ingredients down',
    
    // Buttons
    'button.listMode': 'List Mode',
    'button.swipeMode': 'Swipe Mode',
    'button.recipes': 'Recipes',
    'button.favorites': 'Favorites',
    'button.myFavorites': '❤️ My Favorites',
    
    // Swipe indicators
    'swipe.like': 'LIKE',
    'swipe.pass': 'PASS',
  },
  fr: {
    // Home page
    'home.welcome': 'Bienvenue sur Find Me a Recipe',
    'home.subtitle': 'Découvrez de délicieuses recettes avec vos ingrédients',
    'home.start': 'Commencer',
    
    // Search
    'search.hero': 'Tapez une recette ou un ingrédient',
    'search.placeholder.tomato': 'tomate',
    'search.placeholder.tuna': 'thon',
    'search.placeholder.feta': 'feta',
    'search.placeholder.chicken': 'poulet',
    'search.placeholder.avocado': 'avocat',
    'search.placeholder.pepper': 'poivron',
    'search.placeholder.zucchini': 'courgette',
    'search.placeholder.parmesan': 'parmesan',
    'search.placeholder.basil': 'basilic',
    'search.placeholder.salmon': 'saumon',
    'search.placeholder.lemon': 'citron',
    'search.placeholder.dill': 'aneth',
    'search.placeholder.pasta': 'pâtes à la vodka',
    'search.placeholder.tiramisu': 'tiramisu',
    'search.placeholder.ramen': 'ramen',
    'search.placeholder.dahl': 'dahl',
    'search.placeholder.tacos': 'tacos',
    'search.placeholder.curry': 'curry vert',
    
    // Favorites
    'favorites.title': 'Mes Favoris',
    'favorites.empty': 'Aucun favori pour le moment',
    'favorites.emptyHint': 'Swipe vers la droite pour ajouter des recettes !',
    'favorites.add': 'Ajouter aux favoris',
    'favorites.remove': 'Retirer des favoris',
    'favorites.added': 'Ajouté aux favoris',
    'favorites.removed': 'Retiré des favoris',
    
    // Recipe
    'recipe.back': 'Retour',
    'recipe.quantity': 'Quantité',
    'recipe.totalTime': 'Temps total',
    'recipe.rating': 'Note',
    'recipe.prep': 'Prép',
    'recipe.cook': 'Cuisson',
    'recipe.swipeSteps': 'Swipe pour voir les étapes',
    'recipe.swipeBack': 'Swipe pour revenir',
    'recipe.ingredients': 'Ingrédients',
    'recipe.servings': 'personnes',
    'recipe.decrease': 'Réduire',
    'recipe.increase': 'Augmenter',
    'recipe.checkIngredient': 'Cocher l\'ingrédient',
    'recipe.preparationSteps': 'Étapes de préparation',
    'recipe.hideCompleted': 'Masquer terminées',
    'recipe.showCompleted': 'Afficher {count} terminée(s)',
    'recipe.scrollDown': 'Faire défiler les ingrédients',
    
    // Buttons
    'button.listMode': 'Mode Liste',
    'button.swipeMode': 'Mode Swipe',
    'button.recipes': 'Recettes',
    'button.favorites': 'Favoris',
    'button.myFavorites': '❤️ Mes Favoris',
    
    // Swipe indicators
    'swipe.like': "J'AIME",
    'swipe.pass': 'PASSER',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language');
    return (saved === 'fr' || saved === 'en') ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
    // Clear caches to prevent serving wrong language content
    recipeCache.clear();
    localStorage.removeItem('recipe_images_cache');
  };

  const t = (key: string): string => {
    const translation = translations[language][key as keyof typeof translations['en']];
    return translation || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
