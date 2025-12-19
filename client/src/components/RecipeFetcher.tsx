import Fridge from "./Fridge";
import React, { useEffect, useState } from "react";
import { RecipePreview } from "../types";
import useRecipes from "../hooks/recipes";
import SwipeCard from "./SwipeCard";

type RecipeFetcherProps = {
    ingredientChosenByUser: string;
};

const RecipeFetcher: React.FC<RecipeFetcherProps> = ({ ingredientChosenByUser }) => { 
    const [recipes, setRecipes] = React.useState<Array<RecipePreview>>([]);
    const { getRecipesSummaryFromIngredient } = useRecipes();
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    const isEnoughRecipesFetched = recipes.length - currentIndex > 0;

    useEffect(() => {
        if (!ingredientChosenByUser) return; 

        const fetchRecipes = async () => {
            const new_recipes = await getRecipesSummaryFromIngredient(ingredientChosenByUser);
            setRecipes(recipes.slice(currentIndex).concat(new_recipes));
        };
        
        if (recipes.length - currentIndex <= 5) {
            fetchRecipes();
            setCurrentIndex(0);
        }
        
    }, [ingredientChosenByUser, currentIndex, getRecipesSummaryFromIngredient]); 
    
    return (
        <>    
        <Fridge isLoading={ingredientChosenByUser != "" && !isEnoughRecipesFetched} />
        {   
            ingredientChosenByUser && isEnoughRecipesFetched ?  (
                <div className="search mouse-hover container">
                    <>
                        <div className="swipe-container">
                            {
                                [0, 1, 2].map((offset) => {
                                    const recipe = recipes[currentIndex + offset];
                                    const recipeName = recipe.title;
                                    const recipeImage = recipe.image;

                                    return <SwipeCard
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
                                                isTop={2 - offset === 2}
                                            />
                                })
                            }
                            
                        </div>
                    </>
                </div>
            ): ingredientChosenByUser && !isEnoughRecipesFetched ? (
                <p>Searching For Recipes</p>
            ) : null
        }
        <p>Recipe Fetcher Component</p>
        </>
    )
}

export default RecipeFetcher;