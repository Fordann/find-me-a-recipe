import React, { useState, useEffect, useMemo, useRef } from "react";
import Fridge from "./Fridge";
import SearchBarIngredients from "./SearchBarIngredients";
import FieldSearchRecipe from "./FieldSearchRecipe";
import "../styles/FieldAddingIngredients.css";
import type { Ingredient as IngredientType, RecipePreview } from "../types";

type FieldAddingIngredientsProps = {
    ingredients: IngredientType[];
    createIngredientFromData: (ingredient_value: string, ingredient_image: string) => void;
    updateIngredients: (ingredients: IngredientType[]) => void;
    onSearchComplete?: () => void;
    presetSearchQuery?: string | undefined;
    favorites?: string[];
    onFavoritesChange?: (favs: string[]) => void;
    refreshFavorites?: () => void;
    onRecipeView?: (viewing: boolean) => void;
    showFavoritesGrid?: boolean;
    onToggleFavoritesGrid?: () => void;
};

const FieldAddingIngredients: React.FC<FieldAddingIngredientsProps> = ({ 
    ingredients, 
    createIngredientFromData, 
    updateIngredients,
    onSearchComplete,
    presetSearchQuery,
    favorites = [],
    onFavoritesChange,
    refreshFavorites,
    onRecipeView,
    showFavoritesGrid = false,
    onToggleFavoritesGrid
}) => {
    const [isDisplayRecipes, setIsDisplayRecipes] = useState<boolean>(false);
    const [recipes, setRecipes] = useState<any>([]);
    const [typedWord, setTypedWord] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const lastWordRef = useRef<string>("");

    useEffect(() => {
        if (typedWord !== "") {
            lastWordRef.current = typedWord;
        }
    }, [typedWord]);

    const researchRecipe = (ingredient: string) => {
        console.log("Researching recipes with ingredient:", ingredient);
        // Show fridge animation while preparing swipe; switch when ready
        setIsLoading(true);
        const language = localStorage.getItem('app_language')
        
        fetch(`${language}/research_recipe/${ingredient}`, {
            method: "GET",
            headers: { "Content-Type": "application/json"},
        })
            .then((response) => response.json())
            .then((data) => {
                setRecipes(data);
                // Swipe becomes available once deck is prepared
                setIsDisplayRecipes(true);
                setIsLoading(false);
                onSearchComplete && onSearchComplete();
            })
            .catch((error) => {
                console.error("Error fetching recipes:", error);
                setIsLoading(false);
            });
    };

    return (
        <>  
            {showFavoritesGrid && onToggleFavoritesGrid ? (
                <FieldSearchRecipe
                    recipes={recipes}
                    ingredients={lastWordRef.current}
                    onBackToSearch={() => setIsDisplayRecipes(false)}
                    favorites={favorites}
                    onRecipeView={onRecipeView}
                    showFavoritesGrid={showFavoritesGrid}
                    onToggleFavoritesGrid={onToggleFavoritesGrid}
                    onToggleFavorite={(name) => {
                        console.log('Toggle favorite called for:', name);
                        fetch('/favorites/toggle', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name })
                        })
                        .then(r => r.json())
                        .then(data => {
                            console.log('Toggle favorite response:', data);
                            if (data.favorites && onFavoritesChange) {
                                onFavoritesChange(data.favorites);
                            } else if (refreshFavorites) {
                                refreshFavorites();
                            }
                        })
                        .catch(err => console.error('Error toggling favorite:', err));
                    }}
                />
            ) : !isDisplayRecipes ? (
                <div className="add_ingredients mouse-hover container">
                    <Fridge isLoading={isLoading} />
                    <SearchBarIngredients 
                        onType={setTypedWord}
                        apiCall={() => researchRecipe(lastWordRef.current)}
                        isLoading={isLoading}
                    />
                    <div className="action-row" style={{ opacity: isLoading ? 0 : 1, pointerEvents: isLoading ? 'none' : 'auto', transition: 'opacity 0.6s ease, transform 0.6s ease', transform: isLoading ? 'scale(0.95)' : 'scale(1)' }}>
                        {onToggleFavoritesGrid && (
                            <button type="button" className="btn_favorites" onClick={onToggleFavoritesGrid}>
                                ❤️ Favorites {favorites && favorites.length > 0 ? `(${favorites.length})` : ''}
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <FieldSearchRecipe
                    recipes={recipes}
                    ingredients={lastWordRef.current}
                    onBackToSearch={() => setIsDisplayRecipes(false)}
                    favorites={favorites}
                    onRecipeView={onRecipeView}
                    showFavoritesGrid={showFavoritesGrid}
                    onToggleFavoritesGrid={onToggleFavoritesGrid}
                    onToggleFavorite={(name) => {
                        console.log('Toggle favorite called for:', name);
                        fetch('/favorites/toggle', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name })
                        })
                        .then(r => r.json())
                        .then(data => {
                            console.log('Toggle favorite response:', data);
                            if (data.favorites && onFavoritesChange) {
                                onFavoritesChange(data.favorites);
                            } else if (refreshFavorites) {
                                refreshFavorites();
                            }
                        })
                        .catch(err => console.error('Error toggling favorite:', err));
                    }}
                />
            )}
        </>
    );
};

export default React.memo(FieldAddingIngredients);
