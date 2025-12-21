import { useSelector } from "react-redux";
import { useCallback } from "react";
import { RootState } from "../store/store";

const useFavoriteRecipes = () => {
    const language = useSelector((state: RootState) => state.language.value) 

    //Will fetch the summary (image + title) of recipes saved in favorites
    const getFavoritesRecipe = useCallback(() => {
        return fetch(`/${language}/favorites`,
            {
                method: 'GET',
                headers: { 'Content-Type': 'application/json'}
            }
        ).then((response) => response.json())
        .then((data) => data)
    }, [language]);

    const getNumberOfFavoritesRecipe = useCallback(() => {
        return fetch(`/${language}/favorites/number`,
            {
                method: 'GET',
                headers: { 'Content-Type': 'application/json'}
            }
        ).then((response) => response.json())
        .then((data) => data.number)
    }, []);

    const addNewFavoriteRecipe = useCallback((recipeName: string) => {
        return fetch(`/${language}/favorites/${recipeName}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'}
            }
        ).then((response) => response.ok)
    }, [language]);

    const removeFavoriteRecipe = useCallback((recipeName: string) => {
        return fetch(`/${language}/favorites/${recipeName}`,
            {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json'}
            }
        ).then((response) => response.ok)
    }, [language]);

    return {
        getFavoritesRecipe,
        getNumberOfFavoritesRecipe,
        addNewFavoriteRecipe,
        removeFavoriteRecipe
    }
}

export default useFavoriteRecipes;