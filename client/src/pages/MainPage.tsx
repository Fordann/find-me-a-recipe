import React, { useState, useEffect } from "react";
import { FieldAddingIngredients } from "../components";
import { v4 as uuidv4 } from "uuid";
import type { Ingredient } from "../types";

const MainPage: React.FC = () => {
    const [ingredientsInFridge, setIngredientsInFridge] = useState<Ingredient[]>([]);
    const [favorites, setFavorites] = useState<string[]>([]);
    const [showFavoritesGrid, setShowFavoritesGrid] = useState<boolean>(false);
    const [isViewingRecipe, setIsViewingRecipe] = useState<boolean>(false);

    // Function to add an ingredient
    const createIngredientFromData = (ingredient_value: string, ingredient_image: string): void => {
        setIngredientsInFridge((prevIngredients) => [
            ...prevIngredients,
            { id: uuidv4(), value: ingredient_value, quantity: 1, image: ingredient_image }
        ]);
    };

    // Function to update ingredients
    const updateIngredients = (ingredients: Ingredient[]): void => {
        setIngredientsInFridge(ingredients);
    };

    const refreshFavorites = async () => {
        try {
            const r = await fetch('/favorites');
            const data = await r.json();
            setFavorites(Array.isArray(data) ? data : []);
        } catch (e) {}
    };

    useEffect(() => { refreshFavorites(); }, []);

    return (
        <FieldAddingIngredients
            updateIngredients={updateIngredients}
            createIngredientFromData={createIngredientFromData}
            ingredients={ingredientsInFridge}
            favorites={favorites}
            onFavoritesChange={setFavorites}
            refreshFavorites={refreshFavorites}
            onRecipeView={setIsViewingRecipe}
            showFavoritesGrid={showFavoritesGrid}
            onToggleFavoritesGrid={() => setShowFavoritesGrid(!showFavoritesGrid)}
        />
    );
};

export default MainPage;
