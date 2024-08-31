import { useState } from "react";


function SearchBar(props) {
    const [ingredient, setIngredient] = useState(props.value);

    function handleChange(event) {
        event.preventDefault();
        setIngredient(event.target.value); 
      }

      
  
    return (
      <div>
        <p>Type ingredients, click the add button and enjoy your recipe</p>
        <form >
          <input
            type="text"
            id="search-bar"
            className="input input__lg"
            name={ingredient}
            autoComplete="on"
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


  
  export default SearchBar;