import { useState } from "react";
import "./styles/SearchBarIngredients.css"

function SearchBarIngredients(props) {
    const [ingredient, setIngredient] = useState(props.value);

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
            props.addIngredient(ingredient);
            document.getElementById("search-bar").value=""; 
            }}>
            Add Ingredient
          </button>
          <button type="button"
          className="btn_search_with_ingredients"
          onClick={()=> {
            props.apiCall();
               
          }}>
          Start Research
          </button>
        </form>
      </div>
    );
  }


  
  export default SearchBarIngredients;