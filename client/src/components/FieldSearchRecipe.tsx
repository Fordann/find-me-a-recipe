import React, { useEffect, useRef, useState } from "react";
import Recipe from "./Recipe";
import StyledButton from "./buttons/StyledButton";
import SwipeCard from "./SwipeCard";
import "../styles/FieldSearchRecipe.css";
import "../styles/RecipeList.css";
import "../styles/FloatingButtons.css";
import type { Recipe as RecipeType, RecipePreview } from "../types";
import anime from "animejs";
import { recipeCache } from "../utils/recipeCache";
import useRecipes from "../hooks/recipes";
import Fridge from "./Fridge";

type FieldSearchRecipeProps = {
    ingredientChosenByUser: string;
    onBackToSearch?: () => void;
    favorites?: string[];
    onToggleFavorite?: (name: string) => void;
    onRecipeView?: (viewing: boolean) => void;
    showFavoritesGrid?: boolean;
    onToggleFavoritesGrid?: () => void;
};

const FieldSearchRecipe: React.FC<FieldSearchRecipeProps> = ({ ingredientChosenByUser, onBackToSearch, favorites = [], onToggleFavorite, onRecipeView, showFavoritesGrid = false, onToggleFavoritesGrid }) => {
    const [recipe, setRecipe] = useState<RecipeType | null>(null);
    const [isIngredientChosen, setIsRecipeChosen] = useState<boolean>(false);
    const listRef = useRef<HTMLDivElement | null>(null);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [cameFromFavorites, setCameFromFavorites] = useState<boolean>(false);
    const [recipes, setRecipes] = useState<RecipePreview[]>([] as RecipePreview[])

    const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
    const [seenNames, setSeenNames] = useState<Set<string>>(new Set());
    const {getWholeRecipeFromID, getRecipesSummaryFromIngredient} = useRecipes();
    
    useEffect(() => {
        fetchRecipes();
    }, [ingredientChosenByUser]);
    

    // Trigger background fetch when few cards remain
    
    useEffect(() => {
        const remaining = recipes.length - currentIndex;
        if (remaining <= 5) {
            fetchRecipes();
        }
    }, [currentIndex, recipes.length]);
    
    // Fetch more recipes when nearing end of deck
    const fetchRecipes = async () => {
        console.log("fetch");
        if (isFetchingMore) return;
        setIsFetchingMore(true);
        try {

            const recipes: Array<RecipePreview> = await getRecipesSummaryFromIngredient(ingredientChosenByUser);

            // dedupe by name
            const toAppend: RecipePreview[] = [];
            const newNames: string[] = [];
            recipes.forEach((recipe) => {
                const nm = typeof recipe === 'string' ? recipe : recipe.title;
                if (!seenNames.has(nm)) {
                    toAppend.push(recipe);
                    newNames.push(nm);
                }
            });
            if (toAppend.length > 0) {
                setRecipes((prev) => [...prev, ...toAppend]);
                setSeenNames((prev) => {
                    const next = new Set(prev);
                    newNames.forEach((n) => next.add(n));
                    return next;
                });
            }
        } catch (e) {
            console.error('Error fetching more recipes:', e);
        } finally {
            setIsFetchingMore(false);
        }
    };

    useEffect(() => {
        onRecipeView && onRecipeView(isIngredientChosen);
    }, [isIngredientChosen, onRecipeView]);
   /*
    const searchRecipe = async (recipe_name: string): Promise<void> => {
        console.log(recipe_name);
        
        // Check cache first
        const cached = recipeCache.get(recipe_name);
        if (cached) {
            console.log('Using cached recipe:', recipe_name);
            const builtRecipe: RecipeType = {
                name: cached.name,
                image: cached.images,
                budget: cached.budget,
                cook_time: cached.cook_time,
                difficulty: cached.difficulty,
                ingredients: cached.ingredients,
                nb_comments: cached.nb_comments,
                prep_time: cached.prep_time,
                rate: cached.rate,
                recipe_quantity: cached.recipe_quantity,
                steps: cached.steps,
                total_time: cached.total_time,
            };
            setRecipe(builtRecipe);
            setIsRecipeChosen(true);
            return;
        }    

        try {
            setLoadingRecipeName(recipe_name);
            const _recipe = getWholeRecipeFromID(recipe_name)
            
            // Cache the recipe
            recipeCache.set(recipe_name, _recipe);

            const builtRecipe: RecipeType = {
                name: _recipe.name,
                image: _recipe.images,
                budget: _recipe.budget,
                cook_time: _recipe.cook_time,
                difficulty: _recipe.difficulty,
                ingredients: _recipe.ingredients,
                nb_comments: _recipe.nb_comments,
                prep_time: _recipe.prep_time,
                rate: _recipe.rate,
                recipe_quantity: _recipe.recipe_quantity,
                steps: _recipe.steps,
                total_time: _recipe.total_time,
            };

            // Preload first image before rendering recipe page
            const firstImage = Array.isArray(builtRecipe.image) ? builtRecipe.image[0] : builtRecipe.image;
            if (firstImage) {
                const img = new Image();
                img.src = firstImage;
                img.onload = () => {
                    setRecipe(builtRecipe);
                    setIsRecipeChosen(true);
                    setLoadingRecipeName(null);
                };
                img.onerror = () => {
                    setRecipe(builtRecipe); // fallback even if image fails
                    setIsRecipeChosen(true);
                    setLoadingRecipeName(null);
                };
            } else {
                setRecipe(builtRecipe);
                setIsRecipeChosen(true);
                setLoadingRecipeName(null);
            }
          
        } catch (error) {
            console.error("Error fetching recipe:", error);
            setLoadingRecipeName(null);
        }
    };
    */
    useEffect(() => {
        if (listRef.current) {
            anime({
                targets: listRef.current.querySelectorAll(".recipe-card"),
                opacity: [0, 1],
                translateY: [20, 0],
                scale: [0.98, 1],
                easing: "easeOutQuad",
                delay: anime.stagger(80),
                duration: 450,
            });
        }
    }, [recipes]);
    
    return (
        <>  
            {
                !ingredientChosenByUser ?
                    <Fridge isLoading={false} />
                :    
                <>
                <Fridge isLoading={!recipes.length} />
            {isIngredientChosen ? (
                <div className="recipe">
                    {recipe && <Recipe value={recipe} onBack={() => {
                        setIsRecipeChosen(false);
                        if (cameFromFavorites && onToggleFavoritesGrid) {
                            // If we came from favorites, close the favorites grid and go back to main screen
                            onToggleFavoritesGrid();
                        }
                        setCameFromFavorites(false);
                        if (onRecipeView) onRecipeView(false);
                    }} />}
                </div>
            ) : (
                <div className="search mouse-hover container">
                    <>
                        <div className="swipe-container">
                            {recipes.length > 0 && (
                                <>
                                {[0, 1, 2].map((offset) => {
                                    if (recipes.length === 0) return null;
                                    
                                    const actualIndex = currentIndex + offset;
                                    if (actualIndex >= recipes.length) return null;
                                    const recipeItem = recipes[actualIndex];
                                    const reversedIdx = 2 - offset; // For z-index (last = highest)
                                    
                                    // Extract name and image from either string (favorites) or RecipePreview object
                                    const recipeName = typeof recipeItem === 'string' ? recipeItem : recipeItem.title;
                                    const recipeImage = typeof recipeItem === 'string' ? '' : recipeItem.image;
                                    console.log(`Recipe ${offset}: ${recipeName}, image: ${recipeImage ? 'YES' : 'NO'}`);
                                    const isFav = favorites.includes(recipeName);
                                    
                                    return (
                                        <SwipeCard
                                            key={`${recipeName}-${currentIndex}-${offset}`}
                                            recipe={{ title: recipeName, img: recipeImage, id: `${recipeName}-${currentIndex}-${offset}` }}
                                                onSwipeLeft={() => {
                                                console.log('Skipped:', recipeName);
                                                setCurrentIndex(prev => prev + 1);
                                            }}
                                            onSwipeRight={() => {
                                                console.log('Liked:', recipeName);
                                                console.log('isFav:', isFav, 'onToggleFavorite exists:', !!onToggleFavorite);
                                                // Add to favorites if not already
                                                if (!isFav && onToggleFavorite) {
                                                    console.log('Calling onToggleFavorite for:', recipeName);
                                                    onToggleFavorite(recipeName);
                                                    
                                                    // Preload full recipe in background (don't await)
                                                    
                                                    const language = localStorage.getItem('app_language');
                                                    const recipe = getWholeRecipeFromID(recipeName);
                                                    console.log('✓ Preloaded recipe for favorite:', recipeName);
                                                    recipeCache.set(recipeName, recipe)
                                                    
                                                    // Animate the heart button with CSS animation
                                                    const heartBtn = document.querySelector('.floating-favorites-btn');
                                                    if (heartBtn) {
                                                        heartBtn.classList.add('pulse');
                                                        setTimeout(() => {
                                                            heartBtn.classList.remove('pulse');
                                                        }, 500);
                                                    }
                                                } else {
                                                    console.log('Skipping toggle - already favorite or no handler');
                                                }
                                                // Just increment index to continue swiping
                                                setCurrentIndex(prev => prev + 1);
                                            }}
                                            zIndex={reversedIdx}
                                            isTop={offset === 0}
                                        />
                                    );
                                })}
                            </>
                        )}
                        {(recipes.length === 0 || currentIndex >= recipes.length) && (
                            <div className="swipe-empty">
                                <div className="swipe-loading-spinner"></div>
                                <p>Searching for recipes…</p>
                            </div>
                        )}
                        </div>
                        {onToggleFavoritesGrid && (
                            <button className="floating-favorites-btn" onClick={onToggleFavoritesGrid}>
                                ❤️ {favorites.length > 0 && <span className="favorites-count">{favorites.length}</span>}
                            </button>
                        )}
                        {onBackToSearch && (
                            <button className="floating-back-btn" onClick={onBackToSearch}>
                                ←
                            </button>
                        )}
                    </>
                </div>
            )}
        </>
        }
        </>
    );
};

export default FieldSearchRecipe;
