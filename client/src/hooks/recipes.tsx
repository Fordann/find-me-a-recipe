import { useLanguage } from "../contexts/LanguageContext"
import { useCallback } from "react";

const useRecipes = () => {
    const { language } = useLanguage();

    const getRecipesSummaryFromIngredient = useCallback((ingredient_name: string) => {
        return fetch(
            `/${language}/recipes/ingredient_name/${ingredient_name}`,
            {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            }
        ).then((response) => {
            if (!response.ok) {
                throw new Error('Failed to fetch recipes summary')
            }
            return response.json();
        });
    }, [language]);


    const getWholeRecipeFromID = useCallback((id: string) => {
        return fetch(
            `/${language}/recipes/${id}`,
            {
                method: 'GET',
                headers: { 'Content-Type': 'application/json'}
            }
        ).then((response) => {
            if (!response.ok) {
                throw new Error('Failed to fetch detailed recipe')
            }
            return response.json();
        });
    }, [language]);

    return {
        getRecipesSummaryFromIngredient,
        getWholeRecipeFromID
    }
}

export default useRecipes;