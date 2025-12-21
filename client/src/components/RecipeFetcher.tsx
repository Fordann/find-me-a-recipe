import Fridge from "./Fridge";
import React, { useEffect, useState } from "react";
import { RecipePreview } from "../types";
import useRecipes from "../hooks/recipes";
import SwipeCard from "./SwipeCard";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

type RecipeFetcherProps = {

};

const RecipeFetcher: React.FC<RecipeFetcherProps> = () => { 
    const [recipes, setRecipes] = React.useState<Array<RecipePreview>>([]);
    const { getRecipesSummaryFromIngredient } = useRecipes();
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const ingredientChosenByUser = useSelector((state: RootState) => state.ingredient.value);

    const isEnoughRecipesFetchedForDisplay = recipes.length - currentIndex > 2;
    const needMoreRecipes = recipes.length - currentIndex < 5;

    useEffect(() => {
        if (!ingredientChosenByUser) return; 

        const fetchRecipes = async () => {
            console.log("index before fetched: ", currentIndex);
            const new_recipes = await getRecipesSummaryFromIngredient(ingredientChosenByUser);
            console.log("index after fetched:", currentIndex);
            setRecipes(prev => prev.slice(currentIndex).concat(new_recipes));
            setCurrentIndex(0);
        };
        
        if (needMoreRecipes) {
            fetchRecipes();  
        }
        
    }, [ingredientChosenByUser, currentIndex, getRecipesSummaryFromIngredient, needMoreRecipes]); 
    
    return (
        <>    
        <Fridge isLoading={ingredientChosenByUser !== "" && !isEnoughRecipesFetchedForDisplay} />
        {   
            ingredientChosenByUser && isEnoughRecipesFetchedForDisplay && 
                <div className="search mouse-hover container">
                    <>
                        <div className="swipe-container">
                            {
                                // recipes are displayed as a deck of cards, load 3 cards and stack them with zIndex
                                [0, 1, 2].map((offset) => {
                                    const recipe = recipes[currentIndex + offset];
                                    const recipeName = recipe.title;
                                    const recipeImage = recipe.image;

                                    return (
                                        <SwipeCard
                                            key={`${recipeName}`}
                                            recipe={{ title: recipeName, img: recipeImage, id: `${recipeName}` }}
                                                onSwipeLeft={() => {
                                                setCurrentIndex(prev => prev + 1)
                                                console.log('Recipe discarded');
                                            }}
                                            onSwipeRight={() => {
                                                console.log('Recipe added to Favorites');
                                                setCurrentIndex(prev => prev + 1);
                                            }}
                                            zIndex={2 - offset}
                                            isTop={!offset}
                                        />
                                    )
                                })
                            }  
                        </div>
                    </>
                </div>
        }
        <p>Recipe Fetcher Component</p>
        </>
    )
}

export default RecipeFetcher;