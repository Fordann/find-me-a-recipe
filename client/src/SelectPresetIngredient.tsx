import React from "react";
import ResponsiveButton from "./components/ResponsiveButton";

// Typage des props
interface SelectPresetIngredientPageProps {
  createIngredientFromData: (value: string, image: string) => void;
  uploadPresetIngredients: () => void;
  ingredients : Ingredient[];
}

type Ingredient = {
  id: string;
  value: string;
  quantity: number;
  image: string;
};

const SelectPresetIngredientPage: React.FC<SelectPresetIngredientPageProps> = ({ createIngredientFromData, uploadPresetIngredients }) => {
  
  // Typage du paramètre choosed_preset
  function fillFridgWithPresetIngredients(choosed_preset: string): void {
    fetch('/data/presetIngredients.json')
      .then((response) => response.json())
      .then((json) => {
        json[choosed_preset].forEach((element: { value: string, image: string }) => {
          createIngredientFromData(element.value, element.image);
        });
        uploadPresetIngredients();
      });
  }

  return (
    <>
      <ResponsiveButton value="végé" onClick={() => fillFridgWithPresetIngredients("végé")} />
      <ResponsiveButton value="patissier" onClick={() => fillFridgWithPresetIngredients("patissier")} />
      <ResponsiveButton value="personnalisé" onClick={() => fillFridgWithPresetIngredients("personnalisé")} />
    </>
  );
};

export default SelectPresetIngredientPage;
