import React, { useEffect, useRef, useState } from "react";
import Recipe from "./Recipe";
import ResponsiveButton from "./ResponsiveButton";
import SwipeCard from "./SwipeCard";
import FavoritesGrid from "./FavoritesGrid";
import "../styles/FieldSearchRecipe.css";
import "../styles/RecipeList.css";
import "../styles/FloatingButtons.css";
import type { Recipe as RecipeType, Ingredient, RecipePreview } from "../types";
import anime from "animejs";
import { recipeCache } from "../utils/recipeCache";

type FieldSearchRecipeProps = {
    recipes: RecipePreview[];
    ingredients: Ingredient[];
    onBackToSearch?: () => void;
    favorites?: string[];
    onToggleFavorite?: (name: string) => void;
    onRecipeView?: (viewing: boolean) => void;
    showFavoritesGrid?: boolean;
    onToggleFavoritesGrid?: () => void;
};

const FieldSearchRecipe: React.FC<FieldSearchRecipeProps> = ({ recipes, ingredients, onBackToSearch, favorites = [], onToggleFavorite, onRecipeView, showFavoritesGrid = false, onToggleFavoritesGrid }) => {
    const [recipe, setRecipe] = useState<RecipeType | null>(null);
    const [isRecipeChosen, setIsRecipeChosen] = useState<boolean>(false);
    const [loadingRecipeName, setLoadingRecipeName] = useState<string | null>(null);
    const listRef = useRef<HTMLDivElement | null>(null);
    const [showFavorites, setShowFavorites] = useState<boolean>(false);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [cameFromFavorites, setCameFromFavorites] = useState<boolean>(false);
    const [useTinderMode, setUseTinderMode] = useState<boolean>(true);
    const [recipesWithImages, setRecipesWithImages] = useState<RecipePreview[]>(() => {
        // Check cache first
        const cache = localStorage.getItem('recipe_images_cache');
        const imageCache = cache ? JSON.parse(cache) : {};

        return recipes.map(r => {
            const name = typeof r === 'string' ? r : r.name;
            const cachedImage = imageCache[name];
            return cachedImage ? { name, image: cachedImage } : r;
        });
    });
    const [loadingImages, setLoadingImages] = useState<Set<number>>(new Set());
    const preloadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
    const [seenNames, setSeenNames] = useState<Set<string>>(new Set());

    // Preload all favorite recipes in background on mount
    useEffect(() => {
        if (favorites.length === 0) return;
        
        console.log(`🔄 Preloading ${favorites.length} favorite recipes...`);
        let loaded = 0;
        
        favorites.forEach((recipeName, index) => {
            // Check if already cached
            if (recipeCache.get(recipeName)) {
                console.log(`  ✓ Already cached: ${recipeName}`);
                return;
            }
            
        });
    }, [favorites]);

    // Update recipesWithImages when recipes prop changes
    useEffect(() => {
        const cache = localStorage.getItem('recipe_images_cache');
        const imageCache = cache ? JSON.parse(cache) : {};
        const next = recipes.map(r => {
            const name = typeof r === 'string' ? r : r.name;
            const cachedImage = imageCache[name];
            return cachedImage ? { name, image: cachedImage } : r;
        });
        setRecipesWithImages(next);
        // initialize seen names for dedupe
        const names = new Set<string>();
        next.forEach((ri: RecipePreview) => {
            const nm = typeof ri === 'string' ? ri : ri.name;
            names.add(nm);
        });
        setSeenNames(names);
    }, [recipes]);

    // Batch preload images
    const preloadRecipeImages = async (indices: number[]) => {
        const cache = localStorage.getItem('recipe_images_cache');
        const imageCache = cache ? JSON.parse(cache) : {};
        
        const toLoad = indices.filter(index => {
            if (loadingImages.has(index)) return false;
            const recipeItem = recipesWithImages[index];
            if (!recipeItem) return false;
            const name = typeof recipeItem === 'string' ? recipeItem : recipeItem.name;
            return !imageCache[name] && (typeof recipeItem === 'string' || !recipeItem.image);
        });

        if (toLoad.length === 0) return;

        toLoad.forEach(i => setLoadingImages(prev => new Set(prev).add(i)));

        try {
            const responses = await Promise.all(
                toLoad.map(index => {
                    const recipeItem = recipesWithImages[index];
                    const recipeName = typeof recipeItem === 'string' ? recipeItem : recipeItem.name;
                    const language = localStorage.getItem('app_language')
        
                    return fetch(`${language}/recipe_image/${recipeName}`, {
                        method: "GET",
                        headers: { "Content-Type": "application/json"},
                    }).then(r => r.ok ? r.json() : null)
                      .then(data => ({ index, name: recipeName, image: data?.image }))
                      .catch(() => ({ index, name: recipeName, image: null }));
                })
            );

            const updates: { [key: number]: RecipePreview } = {};
            const cacheUpdates: { [key: string]: string } = { ...imageCache };

            responses.forEach(({ index, name, image }) => {
                if (image) {
                    updates[index] = { name, image };
                    cacheUpdates[name] = image;
                }
            });

            if (Object.keys(updates).length > 0) {
                setRecipesWithImages(prev => {
                    const updated = [...prev];
                    Object.entries(updates).forEach(([idx, recipe]) => {
                        updated[parseInt(idx)] = recipe;
                    });
                    return updated;
                });
                localStorage.setItem('recipe_images_cache', JSON.stringify(cacheUpdates));
            }
        } catch (error) {
            console.error('Batch preload failed:', error);
        } finally {
            toLoad.forEach(i => setLoadingImages(prev => {
                const updated = new Set(prev);
                updated.delete(i);
                return updated;
            }));
        }
    };

    // Debounced batch preload images when approaching the end (no loop)
    useEffect(() => {
        if (!useTinderMode || showFavorites || recipesWithImages.length === 0) return;
        
        // Clear previous timeout
        if (preloadTimeoutRef.current) {
            clearTimeout(preloadTimeoutRef.current);
        }

        // Debounce preloading to avoid excessive calls during rapid swiping
        preloadTimeoutRef.current = setTimeout(() => {
            const indicesToPreload: number[] = [];
            const preloadCount = 10;
            
            for (let i = 3; i < preloadCount; i++) {
                const targetIndex = currentIndex + i;
                if (targetIndex < recipesWithImages.length) {
                    indicesToPreload.push(targetIndex);
                }
            }
            
            preloadRecipeImages(indicesToPreload);
        }, 100); // 100ms debounce

        return () => {
            if (preloadTimeoutRef.current) {
                clearTimeout(preloadTimeoutRef.current);
            }
        };
    }, [currentIndex, useTinderMode, showFavorites, recipesWithImages]);

    // Fetch more recipes when nearing end of deck
    const fetchMoreRecipes = async () => {
        if (isFetchingMore || showFavorites) return;
        setIsFetchingMore(true);
        try {
            const ingredients_to_string = ingredients.map((ing: Ingredient) => ing.value).join(' ');
            const language = localStorage.getItem('app_language');

            const response = await fetch(`${language}/research_recipe/${ingredients_to_string}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }, 
            });

            if (!response.ok) throw new Error('Failed to fetch more recipes');
            const data: Array<RecipePreview> = await response.json();
            // dedupe by name
            const toAppend: RecipePreview[] = [];
            const newNames: string[] = [];
            data.forEach((ri) => {
                const nm = typeof ri === 'string' ? ri : ri.name;
                if (!seenNames.has(nm)) {
                    toAppend.push(ri);
                    newNames.push(nm);
                }
            });
            if (toAppend.length > 0) {
                setRecipesWithImages((prev) => [...prev, ...toAppend]);
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

    // Trigger background fetch when few cards remain
    useEffect(() => {
        if (!useTinderMode || showFavorites) return;
        const remaining = recipesWithImages.length - currentIndex;
        if (remaining <= 5) {
            fetchMoreRecipes();
        }
    }, [currentIndex, recipesWithImages.length, useTinderMode, showFavorites]);

    // Reset index when switching between recipes/favorites or modes
    useEffect(() => {
        setCurrentIndex(0);
    }, [showFavorites, useTinderMode]);

    useEffect(() => {
        onRecipeView && onRecipeView(isRecipeChosen);
    }, [isRecipeChosen, onRecipeView]);

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
            const language = localStorage.getItem('app_language');

            const response = await fetch(`/${language}/detailed_recipe/${recipe_name}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }}
            )
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const _recipe = await response.json();

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
    }, [recipesWithImages]);

    return (
        <>
            {isRecipeChosen ? (
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
            ) : showFavoritesGrid && onToggleFavoritesGrid ? (
                <FavoritesGrid
                    favorites={favorites}
                    onRecipeClick={(recipeName, preloadedRecipe) => {
                        // Don't close favorites grid yet - let the recipe display
                        setCameFromFavorites(true);
                        
                        if (preloadedRecipe) {
                            // Cache the preloaded recipe
                            recipeCache.set(recipeName, preloadedRecipe);
                            
                            // Recipe was preloaded during animation, use it directly
                            const builtRecipe: RecipeType = {
                                name: preloadedRecipe.name,
                                image: preloadedRecipe.images,
                                budget: preloadedRecipe.budget,
                                cook_time: preloadedRecipe.cook_time,
                                difficulty: preloadedRecipe.difficulty,
                                ingredients: preloadedRecipe.ingredients,
                                nb_comments: preloadedRecipe.nb_comments,
                                prep_time: preloadedRecipe.prep_time,
                                rate: preloadedRecipe.rate,
                                recipe_quantity: preloadedRecipe.recipe_quantity,
                                steps: preloadedRecipe.steps,
                                total_time: preloadedRecipe.total_time,
                            };
                            setRecipe(builtRecipe);
                            setIsRecipeChosen(true);
                            
                        } else {
                            // Fallback: load recipe normally (will use cache if available)
                            searchRecipe(recipeName);
                        }
                    }}
                    onRemove={(recipeName) => {
                        if (onToggleFavorite) {
                            onToggleFavorite(recipeName);
                        }
                    }}
                    onClose={onToggleFavoritesGrid}
                />
            ) : !isRecipeChosen ? (
                <div className="search mouse-hover container">
                    {useTinderMode ? (
                        <>
                            <div className="swipe-container">
                                {recipesWithImages.length > 0 && (
                                    <>
                                    {[0, 1, 2].map((offset) => {
                                        const displayList = showFavorites ? favorites : recipesWithImages;
                                        if (displayList.length === 0) return null;
                                        
                                        const actualIndex = currentIndex + offset;
                                        if (actualIndex >= displayList.length) return null;
                                        const recipeItem = displayList[actualIndex];
                                        const reversedIdx = 2 - offset; // For z-index (last = highest)
                                        
                                        // Extract name and image from either string (favorites) or RecipePreview object
                                        const recipeName = typeof recipeItem === 'string' ? recipeItem : recipeItem.name;
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

                                                        fetch(`/${language}/detailed_recipe/${recipeName}`, {
                                                            method: 'GET',
                                                            headers: { 'Content-Type': 'application/json' }})
                                                        .then(res => res.json())
                                                        .then(recipe => {
                                                            console.log('✓ Preloaded recipe for favorite:', recipeName);
                                                            recipeCache.set(recipeName, recipe);
                                                        })
                                                        .catch(err => console.error('Failed to preload recipe:', err));
                                                        
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
                            {(recipesWithImages.length === 0 || currentIndex >= recipesWithImages.length) && (
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
                    ) : (
                        <>
                            <div className="filter_btns">
                                {onBackToSearch && (
                                    <ResponsiveButton value="← Back" onClick={onBackToSearch} />
                                )}
                                {onToggleFavoritesGrid && (
                                    <ResponsiveButton value="❤️ My Favorites" onClick={onToggleFavoritesGrid} />
                                )}
                                <ResponsiveButton value={showFavorites ? "Recipes" : "Favorites"} onClick={() => setShowFavorites(!showFavorites)} />
                                <ResponsiveButton value={useTinderMode ? "List Mode" : "Swipe Mode"} onClick={() => setUseTinderMode(!useTinderMode)} />
                            </div>
                            <div className="recipe-list" ref={listRef}>
                            {(showFavorites ? favorites : recipesWithImages).map((recipeItem) => {
                                const recipeName = typeof recipeItem === 'string' ? recipeItem : recipeItem.name;
                                const isFav = favorites.includes(recipeName);
                                const isLoading = loadingRecipeName === recipeName;
                                return (
                                    <div className={"recipe-card" + (isFav ? " pinned" : "") + (isLoading ? " loading" : "")} key={recipeName}>
                                        <div className="recipe-card__pin" aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'} onClick={(e) => {
                                            e.stopPropagation();
                                            if (onToggleFavorite) {
                                                onToggleFavorite(recipeName);
                                                
                                                // Preload full recipe in background when adding to favorites
                                                if (!isFav) {
                                                    const language = localStorage.getItem('app_language');

                                                    fetch(`/${language}/detailed_recipe/${recipeName}`, {
                                                        method: 'GET',
                                                        headers: { 'Content-Type': 'application/json' }})
                                                    .then(res => res.json())
                                                    .then(recipe => {
                                                        console.log('✓ Preloaded recipe for favorite:', recipeName);
                                                        recipeCache.set(recipeName, recipe);
                                                    })
                                                    .catch(err => console.error('Failed to preload recipe:', err));
                                                }
                                            }
                                            const el = (e.currentTarget as HTMLElement);
                                            anime({ targets: el, scale: [1, 1.5, 1], rotate: [0, 20, -10, 0], easing: 'easeInOutQuad', duration: 600 });
                                            // Particle burst
                                            const parent = el.parentElement;
                                            if (parent) {
                                                const container = document.createElement('div');
                                                container.className = 'pin-particles';
                                                parent.appendChild(container);
                                                for (let i=0;i<12;i++) {
                                                    const p = document.createElement('span');
                                                    container.appendChild(p);
                                                    const angle = (Math.PI * 2 * i)/12;
                                                    const dist = 30 + Math.random()*20;
                                                    anime({
                                                        targets: p,
                                                        opacity: [0,1,0],
                                                        translateX: [0, Math.cos(angle)*dist],
                                                        translateY: [0, Math.sin(angle)*dist],
                                                        scale: [1, 0.4],
                                                        easing: 'easeOutQuad',
                                                        duration: 700,
                                                        delay: i*20
                                                    });
                                                }
                                                setTimeout(()=> { container.remove(); }, 900);
                                            }
                                            // Toast feedback
                                            const toast = document.createElement('div');
                                            toast.className = 'pin-toast';
                                            toast.textContent = isFav ? 'Removed from favorites' : 'Added to favorites';
                                            document.body.appendChild(toast);
                                            anime({ targets: toast, opacity: [0,1], translateY:[-10,0], easing:'easeOutQuad', duration:300 });
                                            setTimeout(()=>{
                                                anime({ targets: toast, opacity:[1,0], translateY:[0,-10], easing:'easeInQuad', duration:250, complete:()=>toast.remove() });
                                            }, 1200);
                                        }}>
                                            {isFav ? '★' : '☆'}
                                        </div>
                                        <div className="recipe-card__body" onClick={() => !isLoading && searchRecipe(recipeName)}>
                                            <div className="recipe-card__title">{recipeName}</div>
                                            <div className={"recipe-card__cta" + (isLoading ? " recipe-card__cta--loading" : "")}>
                                                {isLoading ? 'Loading…' : 'View recipe'}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            </div>
                        </>
                    )}
                </div>
            ) : null}
        </>
    );
};

export default FieldSearchRecipe;
