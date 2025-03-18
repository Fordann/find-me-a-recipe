import { useState } from "react";
import "./styles/SearchBarIngredients.css";

// Définition des types des props
interface SearchBarIngredientsProps {
  addIngredient: (ingredient: string) => void;
  apiCall?: () => void; // Si `apiCall` est utilisé, tu peux le typifier
}

const SearchBarIngredients: React.FC<SearchBarIngredientsProps> = ({addIngredient, apiCall }) => {
  const [ingredient, setIngredient] = useState<string>("");

  // Typage de l'événement dans handleChange
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    event.preventDefault();
    setIngredient(event.target.value);
  };

  return (
    <div className="searchBar">
      <form>
        <input
          type="text"
          id="search-bar"
          className="input input__lg"
          name={ingredient}
          onChange={handleChange}
        />
        <button
          type="button"
          className="btn_add_ingredients"
          onClick={() => {
            addIngredient(ingredient);
            const input = document.getElementById("search-bar") as HTMLInputElement;
            input.value = ""; // Réinitialise la valeur de l'input
          }}
        >
          Add Ingredient
        </button>
      </form>
    </div>
  );
};

export default SearchBarIngredients;
