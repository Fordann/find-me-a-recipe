import React, { useState} from "react";
import { v4 as uuidv4 } from 'uuid';
import Fridge from "./Fridge";
import SearchBarIngredients from "./SearchBarIngredients.js";
import BasicConfigFridge from "./BasicConfigFridge.js";
import Ingredient from "./Ingredient.js";
import "./styles/FieldAddingIngredients.css"
import FieldSearchRecipe from "./FieldSearchRecipe.js";

function FieldAddingIngredients(props) {
    const [isFridgeEmpty, setIsFridgeEmpty] = useState(true);
    const [isFridgeClosed, setIsFridgeClosed] = useState(true);
    const [ingredients, setIngredients] = useState([]);

    function fillFridgWithPresetIngredients(choosed_preset) {
        
        setIsFridgeEmpty(false);

        fetch('/data/presetIngredients.json')
            .then((response) => response.json())
            .then((json) => json[choosed_preset].forEach(element => {
                createIngredientFromData(element.value, element.image);
            }));
    }

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

    function createIngredientFromData(ingredient_value, ingredient_image) {
        setIngredients((prevIngredients)=> [
            ...prevIngredients, 
                 {id:uuidv4(), value:ingredient_value, quantity:1, image:ingredient_image}
            ]);
    }

    async function createIngredientFromName(ingredient_value) {
        const image = await searchImagefromIngredientToFillFridge(ingredient_value);
        createIngredientFromData(ingredient_value, image);
    }
    
    function removeIngredient(ingredient_id) {
        setIngredients(ingredients.filter((ingredient)=>ingredient.id !== ingredient_id));   
    }

    const updateQuantityIngredient = (ingredient_id) => (quantity) => {
        if (quantity === 0) {
            removeIngredient(ingredient_id);
            return;
        } 
        console.log(ingredient_id);
        const updated_ingredients = ingredients.map((ingredient)=> {
            
            if (ingredient.id === ingredient_id) {
                console.log(ingredient, {ingredient, quantity: quantity});
                return { ...ingredient, quantity: quantity }; // Update the quantity
            }
            return ingredient;
        });
        setIngredients(updated_ingredients);
    }

    return (
    <>
        <div className="add_ingredients mouse-hover container">
        {
            isFridgeEmpty ? 
            <>
                <BasicConfigFridge value="végé" click={fillFridgWithPresetIngredients} />
                <BasicConfigFridge value="patissier" click={fillFridgWithPresetIngredients} /> 
                <BasicConfigFridge value="personnalisé" click={fillFridgWithPresetIngredients} />
            </>
            :
            <>
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
                            removeIngredient={removeIngredient}
                            updateQuantityIngredient={updateQuantityIngredient(ingredient.id)}
                        />)}
                    </div>
                }
            </>
        } 
        </div> 
        < FieldSearchRecipe ingredients={ingredients}/>
    </>
    );
}

export default FieldAddingIngredients;

