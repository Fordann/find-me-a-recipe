import React, { useState } from "react";
import FieldAddingIngredients from "../FieldAddingIngredients";
import SelectPresetIngredient from "../SelectPresetIngredient";
import { v4 as uuidv4 } from "uuid";

// Définition du type d'un ingrédient
type Ingredient = {
    id: string;
    value: string;
    quantity: number;
    image: string;
};

const MainPage: React.FC = () => {
    const [isPresetIngredientsChosen, setIsPresetIngredientsChosen] = useState<boolean>(false);
    const [ingredientsInFridge, setIngredientsInFridge] = useState<Ingredient[]>([]);

    // Fonction pour ajouter un ingrédient
    const createIngredientFromData = (ingredient_value: string, ingredient_image: string): void => {
        setIngredientsInFridge((prevIngredients) => [
            ...prevIngredients,
            { id: uuidv4(), value: ingredient_value, quantity: 1, image: ingredient_image }
        ]);
    };

    // Fonction pour mettre à jour les ingrédients
    const updateIngredients = (ingredients: Ingredient[]): void => {
        setIngredientsInFridge(ingredients);
    };

    return (
        <>
            {!isPresetIngredientsChosen ? (
                <SelectPresetIngredient
                    uploadPresetIngredients={() => setIsPresetIngredientsChosen(true)}
                    createIngredientFromData={createIngredientFromData}
                    ingredients={ingredientsInFridge}
                />
            ) : (
                <FieldAddingIngredients
                    updateIngredients={updateIngredients}
                    createIngredientFromData={createIngredientFromData}
                    ingredients={ingredientsInFridge}
                />
            )}
        </>
    );
};

export default MainPage;
