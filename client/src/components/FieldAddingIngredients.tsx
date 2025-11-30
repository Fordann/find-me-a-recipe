import React, { useState, useEffect } from "react";
import Fridge from "./Fridge";
import SearchBarIngredients from "./SearchBarIngredients";
import Ingredient from "./Ingredient";
import FieldSearchRecipe from "./FieldSearchRecipe";
import "../styles/FieldAddingIngredients.css";
import type { Ingredient as IngredientType, RecipePreview } from "../types";
import { cachedFetch } from "../utils/debounce";

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
    const [recipes, setRecipes] = useState<RecipePreview[]>([]);
    const [typedWord, setTypedWord] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const searchImagefromIngredientToFillFridge = async (ingredient_value: string): Promise<string | null> => {
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ingredient: ingredient_value }),
        };

        try {
            const response = await fetch("/image_ingredient", requestOptions);
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            return data.image || null;
        } catch (error) {
            return null;
        }
    };

    const createIngredientFromName = async (ingredient_value: string): Promise<void> => {
        const image = await searchImagefromIngredientToFillFridge(ingredient_value);
        createIngredientFromData(ingredient_value, image || "");
    };

    const updateQuantityIngredient = (ingredient_id: string) => (quantity: number): void => {
        if (quantity === 0) {
            updateIngredients(ingredients.filter((ingredient) => ingredient.id !== ingredient_id));
            return;
        }

        const updatedIngredients = ingredients.map((ingredient) =>
            ingredient.id === ingredient_id ? { ...ingredient, quantity } : ingredient
        );

        updateIngredients(updatedIngredients);
    };

    const researchRecipe = (forcedQuery?: string): void => {
        // Show fridge animation while preparing swipe; switch when ready
        setIsLoading(true);
        const payload = {
            language: (localStorage.getItem('app_language') === 'fr') ? 'fr' : 'en',
            ingredients: {
                aqt: forcedQuery ? forcedQuery : ingredients.map((ingredient) => ingredient.value).join(" "),
            }
        };
        
        cachedFetch<RecipePreview[]>("/research_recipe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })
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

    // Trigger search automatically when a preset query from history is selected
    React.useEffect(() => {
        if (presetSearchQuery && !isDisplayRecipes) {
            researchRecipe(presetSearchQuery);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [presetSearchQuery]);

    return (
        <>  
            {showFavoritesGrid && onToggleFavoritesGrid ? (
                <FieldSearchRecipe
                    recipes={recipes}
                    ingredients={ingredients}
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
                    {/* Center preview removed to prioritize actual search bar */}
                    <SearchBarIngredients 
                        addIngredient={createIngredientFromName} 
                        onType={setTypedWord}
                        apiCall={() => researchRecipe(typedWord)}
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
                    ingredients={ingredients}
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
