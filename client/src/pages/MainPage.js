import React, {useState} from "react";
import FieldAddingIngredients from "../FieldAddingIngredients"
import SelectPresetIngredient from "../SelectPresetIngredient";
import { v4 as uuidv4 } from 'uuid';

function MainPage() {
    const [isPresetIngredientsChoosen, setIsPresetIngredientsChoosen] = useState(false);
    const [ingredientsInFridge, setIngredientsInFridge] = useState([]);

    function createIngredientFromData(ingredient_value, ingredient_image) {
        setIngredientsInFridge((prevIngredients)=> [
            ...prevIngredients, 
                {id:uuidv4(), value:ingredient_value, quantity:1, image:ingredient_image}
            ]);
    }


    function updateIngredients(ingredients) {
        setIngredientsInFridge(ingredients);
    }

    return (
        <>
            {
            !isPresetIngredientsChoosen ? 
                <SelectPresetIngredient 
                    uploadPresetIngredients={()=>setIsPresetIngredientsChoosen(true)} 
                    createIngredientFromData={createIngredientFromData}
                    ingredients={ingredientsInFridge}
                />
            :
                <FieldAddingIngredients 
                    updateIngredients={updateIngredients} 
                    createIngredientFromData={createIngredientFromData}
                    ingredients={ingredientsInFridge}
                />
            }
        </>
    )


}

export default MainPage;