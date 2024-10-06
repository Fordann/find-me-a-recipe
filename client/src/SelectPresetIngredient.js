import React from "react";
import ResponsiveButton from "./components/ResponsiveButton.js";

function SelectPresetIngredientPage({createIngredientFromData, uploadPresetIngredients}) {
    function fillFridgWithPresetIngredients(choosed_preset) {
        fetch('/data/presetIngredients.json')
            .then((response) => response.json())
            .then((json) => {json[choosed_preset].forEach(element => {
                createIngredientFromData(element.value, element.image);}); 
                uploadPresetIngredients();
            });
    }
    return (
        <>
            <ResponsiveButton value="végé" onClick={()=>fillFridgWithPresetIngredients("végé")} />
            <ResponsiveButton value="patissier" onClick={()=>fillFridgWithPresetIngredients("patissier")} /> 
            <ResponsiveButton value="personnalisé" onClick={()=>fillFridgWithPresetIngredients("personnalisé")} />
        </>
    )


}

export default SelectPresetIngredientPage;
