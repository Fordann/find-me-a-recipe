import { useState } from "react";
import "./styles/SearchBarIngredients.css"

function SearchBarIngredients({value, addIngredient, apiCall}) {
    const [ingredient, setIngredient] = useState(value);

    function handleChange(event) {
        event.preventDefault();
        setIngredient(event.target.value); 
      }

      

      
  
    return (
      <div class="searchBar">
        <form >
          <input
            type="text"
            id="search-bar"
            className="input input__lg"
            name={ingredient}
            onChange={handleChange}
          />
          <button type="button" 
          className="btn_add_ingredients"
          onClick={()=> {         
            addIngredient(ingredient);
            document.getElementById("search-bar").value=""; 
            }}>
            Add Ingredient
          </button>
         
        </form>
      </div>
    );
  }


  
  export default SearchBarIngredients;