import React, { useState } from "react";
import FilterButton from "./components/FilterButton";
import Recipe from "./components/Recipe";
import ResponsiveButton from "./components/ResponsiveButton";
import "./styles/FieldSearchRecipe.css";

// Définition des types
type RecipeType = {
    name: string;
    image: string;
    budget: string;
    cook_time: string;
    difficulty: string;
    ingredients: string[];
    nb_comments: number;
    prep_time: string;
    rate: number;
    recipe_quantity: string;
    steps: string[];
    total_time: string;
};

type FieldSearchRecipeProps = {
    recipes: string[];
    ingredients: Ingredient[];
};
type Ingredient = {
    id: string;
    value: string;
    quantity: number;
    image: string;
  };

const FieldSearchRecipe: React.FC<FieldSearchRecipeProps> = ({ recipes }) => {
    const [recipe, setRecipe] = useState<RecipeType | null>(null);
    const [isRecipeChosen, setIsRecipeChosen] = useState<boolean>(false);

    const searchRecipe = async (recipe_name: string): Promise<void> => {
        console.log(recipe_name);
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ aqt: recipe_name }),
        };

        try {
            const response = await fetch("/detailed_recipe", requestOptions);
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const _recipe = await response.json();

            setRecipe({
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
            });

            setIsRecipeChosen(true);
        } catch (error) {
            console.error("Error fetching recipe:", error);
        }
    };

    return (
        <>
            {!isRecipeChosen ? (
                <div className="search mouse-hover container">
                    <div className="filter_btns">
                        <FilterButton value="végé" />
                        <FilterButton value="carnivore" />
                        <FilterButton value="sans tomate" />
                        <FilterButton value="sans lactose" />
                        <FilterButton value="avec gingembre" />
                        <ResponsiveButton value="bob" onClick={() => console.log("bob")} />
                    </div>
                    <>
                        {recipes.map((_recipe) => (
                            <ResponsiveButton key={_recipe} value={_recipe} onClick={() => searchRecipe(_recipe)} />
                        ))}
                    </>
                </div>
            ) : (
                <div className="recipe">
                    {recipe && <Recipe value={recipe} />}
                </div>
            )}
        </>
    );
};

export default FieldSearchRecipe;
