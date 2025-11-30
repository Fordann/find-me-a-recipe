import { recipeCache } from '../utils/recipeCache';

describe('recipeCache', () => {
  beforeEach(() => {
    // Clear cache before each test
    recipeCache.clear();
    localStorage.clear();
    // Set default language
    localStorage.setItem('app_language', 'en');
  });

  test('can set and get cached recipe', () => {
    const recipe = {
      name: 'Test Recipe',
      ingredients: ['flour', 'eggs'],
      steps: ['Mix', 'Bake']
    };

    recipeCache.set('test recipe', recipe);
    const cached = recipeCache.get('test recipe');

    expect(cached).toBeTruthy();
    expect(cached.name).toEqual(recipe.name);
  });

  test('returns null for non-existent recipe', () => {
    const cached = recipeCache.get('non-existent');
    expect(cached).toBeNull();
  });

  test('distinguishes between languages', () => {
    const enRecipe = { name: 'English Recipe', steps: [] };
    const frRecipe = { name: 'Recette Française', steps: [] };

    localStorage.setItem('app_language', 'en');
    recipeCache.set('recipe', enRecipe);

    localStorage.setItem('app_language', 'fr');
    recipeCache.set('recipe', frRecipe);

    localStorage.setItem('app_language', 'en');
    const cachedEn = recipeCache.get('recipe');
    expect(cachedEn.name).toEqual(enRecipe.name);

    localStorage.setItem('app_language', 'fr');
    const cachedFr = recipeCache.get('recipe');
    expect(cachedFr.name).toEqual(frRecipe.name);
  });

  test('clears all cached recipes', () => {
    recipeCache.set('recipe1', { name: 'Recipe 1' });
    recipeCache.set('recipe2', { name: 'Recipe 2' });

    recipeCache.clear();

    expect(recipeCache.get('recipe1')).toBeNull();
    expect(recipeCache.get('recipe2')).toBeNull();
  });

  test('normalizes recipe names', () => {
    const recipe = { name: 'Test' };

    recipeCache.set('Test Recipe', recipe);
    
    // Should find with different casing
    const cached1 = recipeCache.get('test recipe');
    const cached2 = recipeCache.get('TEST RECIPE');
    
    expect(cached1).toBeTruthy();
    expect(cached2).toBeTruthy();
    expect(cached1.name).toEqual(recipe.name);
    expect(cached2.name).toEqual(recipe.name);
  });
});
