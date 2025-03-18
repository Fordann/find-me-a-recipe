import React, { useState } from "react";
import Fridge from "./Fridge";
import SearchBarIngredients from "./SearchBarIngredients";
import Ingredient from "./Ingredient";
import FieldSearchRecipe from "./FieldSearchRecipe";
import "./styles/FieldAddingIngredients.css";

// Définition des types
type IngredientType = {
    id: string;
    value: string;
    quantity: number;
    image: string;
};

type FieldAddingIngredientsProps = {
    ingredients: IngredientType[];
    createIngredientFromData: (ingredient_value: string, ingredient_image: string) => void;
    updateIngredients: (ingredients: IngredientType[]) => void;
};

const FieldAddingIngredients: React.FC<FieldAddingIngredientsProps> = ({ 
    ingredients, 
    createIngredientFromData, 
    updateIngredients 
}) => {
    const [isFridgeClosed, setIsFridgeClosed] = useState<boolean>(true);
    const [isDisplayRecipes, setIsDisplayRecipes] = useState<boolean>(false);
    const [recipes, setRecipes] = useState<string[]>([]);

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
            console.error("Error: image cannot be found", error);
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

    const researchRecipe = (): void => {
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                aqt: ingredients.map((ingredient) => ingredient.value).join(" "),
            }),
        };

        fetch("/research_recipe", requestOptions)
            .then((response) => response.json())
            .then((data) => {
                setRecipes(data);
                setIsDisplayRecipes(!isDisplayRecipes);
            })
            .catch((error) => console.error("Error fetching recipes:", error));
    };

    return (
        <>  
            {!isDisplayRecipes ? (
                <div className="add_ingredients mouse-hover container">
                    <Fridge onClick={() => setIsFridgeClosed(!isFridgeClosed)} />
                    {isFridgeClosed ? (
                        <>
                            <SearchBarIngredients addIngredient={createIngredientFromName} />
                            <button type="button" className="btn_search_with_ingredients" onClick={researchRecipe}>
                                Start Research
                            </button>
                        </>
                    ) : (
                        <div className="ingredients">
                            {ingredients.map((ingredient) => (
                                <Ingredient
                                    key={ingredient.id}
                                    quantity={ingredient.quantity}
                                    image={ingredient.image}
                                    updateQuantityIngredient={updateQuantityIngredient(ingredient.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <FieldSearchRecipe recipes={recipes} ingredients={ingredients} />
            )}
        </>
    );
};

export default FieldAddingIngredients;
