import React, { useState} from "react";
import Fridge from "./Fridge";
import SearchBarIngredients from "./SearchBarIngredients.js";
import Ingredient from "./Ingredient.js";
import FieldSearchRecipe from "./FieldSearchRecipe.js";
import "./styles/FieldAddingIngredients.css"


function FieldAddingIngredients({ingredients, createIngredientFromData,updateIngredients}) {
    const [isFridgeClosed, setIsFridgeClosed] = useState(true);

    const searchImagefromIngredientToFillFridge = async (ingredient_value)=> {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ingredient_value)
        };
        try {
            const reponse = await fetch("/image_ingredient", requestOptions);
            if (!reponse) {
                throw new Error("Network response was not ok")
            }
            const data = reponse.json();
            return data;
        } catch (error) {
            console.error("Error : image cannot be found", error);
        }
    }
    
    async function createIngredientFromName(ingredient_value) {
        const image = await searchImagefromIngredientToFillFridge(ingredient_value);
        createIngredientFromData(ingredient_value, image);
    }
    
    const updateQuantityIngredient = (ingredient_id) => (quantity) => {
        if (quantity === 0) {
            function removeIngredient(ingredient_id) {
                updateIngredients(ingredients.filter((ingredient)=>ingredient.id !== ingredient_id));   
            }
            removeIngredient(ingredient_id);
            return;
        } 

        const updated_ingredients = ingredients.map((ingredient)=> {
            if (ingredient.id === ingredient_id) {
                return { ...ingredient, quantity: quantity }; // Update the quantity
            }
            return ingredient;
        });
        updateIngredients(updated_ingredients);
    }

    return (
    <>
        <div className="add_ingredients mouse-hover container">
            <Fridge onClick={() => {setIsFridgeClosed(!isFridgeClosed);}} />
            {
                isFridgeClosed ? 
                <SearchBarIngredients addIngredient={createIngredientFromName}/>
                :
                <div className="ingredients">
                    {ingredients.map((ingredient)=> 
                    <Ingredient 
                        key={ingredient.id}
                        value={ingredient.value}
                        quantity={ingredient.quantity}
                        image={ingredient.image}
                        updateQuantityIngredient={updateQuantityIngredient(ingredient.id)}
                    />)}
                </div>
            }
        </div> 
        < FieldSearchRecipe ingredients={ingredients}/>
    </>
    );
}

export default FieldAddingIngredients;

