import React, { useState, useRef, createContext} from "react";
import Fridge from "./Fridge";
import SearchBarIngredients from "./SearchBarIngredients.js";
import BasicConfigFridge from "./BasicConfigFridge.js";
import Ingredient from "./Ingredient.js";
import "./styles/FieldAddingIngredients.css"

const ContainerContext = createContext(null);


function FieldAddingIngredients(props) {
    const [isFridgeEmpty, setIsFridgeEmpty] = useState(true);
    const [isFridgeClosed, setIsFridgeClosed] = useState(true);
    const [ingredientsComponent, setIngredientsComponent] = useState("");
    const field_adding_container = useRef(null);

    function fillFridgWithPresetIngredients() {
        setIsFridgeEmpty(false);
    }

    async function addIngredient(ingredient_name) {
        function searchImagefromIngredientToFillFridge(ingredient_name) {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ingredient_name)
            };
            return fetch("/image_ingredient", requestOptions)
                    .then(response => response.json())
                    .then(data => {console.log(data);
                        return data;
                    });    
        }

        const image = await searchImagefromIngredientToFillFridge(ingredient_name);
        setIngredientsComponent([...ingredientsComponent, <Ingredient key={ingredientsComponent.size} image={image} value={ingredient_name} quantity="1"/>])
    }

    return (
        <ContainerContext.Provider ref={field_adding_container}>
            <div className="add_ingredients mouse-hover container">
            {
                isFridgeEmpty ? 
                <>
                    <BasicConfigFridge text="végé" click={fillFridgWithPresetIngredients} />
                    <BasicConfigFridge text="patissier" click={fillFridgWithPresetIngredients} /> 
                    <BasicConfigFridge text="personnaliser" click={fillFridgWithPresetIngredients} />
                </>
                :
                <>
                    <Fridge onClick={() => setIsFridgeClosed(!isFridgeClosed)} />
                    {
                        isFridgeClosed ? 
                        <SearchBarIngredients addIngredient={addIngredient}/>
                        :
                        <></>
                    }
                </>
            } 
            </div>  
        </ContainerContext.Provider>
    );
}

export default FieldAddingIngredients;

