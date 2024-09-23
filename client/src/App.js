import React, { useState } from "react";
import SearchBar from "./SearchBar";
import Ingredient from "./Ingredient";
import Filter from "./Filter";
import Fridge from "./Fridge";
import fridge_close from "./images/frigo.svg"
import fridge_open from "./images/fridge_open.jpg";

function App() {
    const [ingredients, setIngredients] = useState(new Map());
    const [ingredientsComponent, setIngredientsComponent] = useState("");
    const [fridge_state, setFridgeState] = useState("close");
    const [filters, setFilters] = useState("");
    const [data, setdata] = useState({
      budget: 0,
      cook_time: 0,
      difficulty: 0,
      ingredients: 0,
      name: 0,
      nb_comments : 0,
      prep_time : 0,
      rate: 0,
      recipe_quantity : 0,
      steps: 0, 
      total_time: 0
    });

    function addIngredient(ingredient) {
      ingredients.set(ingredient, 1);
      setIngredients(ingredients);
      searchImagefromIngredient(ingredient);
    }

    function changeQuantityIngredient(ingredient, quantity) {
      let new_quantity_ingredients = {...ingredients};
      new_quantity_ingredients[ingredient] = quantity;
      setIngredients(new_quantity_ingredients);
    }

    function changeFridgeState(fridge_html_content) {
      if (fridge_state === "open") {
        setFridgeState("close");
        fridge_html_content.src = fridge_close;
      }
      else {
        setFridgeState("open");
        fridge_html_content.src = fridge_open;
      }
    }

    function searchImagefromIngredient(ingredient) {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ingredient)
      };
      fetch("/image_ingredient", requestOptions)
          .then(response => response.json())
          .then(data => {console.log(data);
            setIngredientsComponent([...ingredientsComponent, <Ingredient id={ingredients.size} image={data} changeQuantity={changeQuantityIngredient} value={ingredient}/>])})
    }
      
    function apiCall() {
      
      // POST request using fetch inside useEffect React hook
      /*
      const donnees = {
          "aqt": "boeuf bourguignon",  
          "dt": "platprincipal",      
          "exp": 2,                   
          "dif": 2,                   
          "veg": 0,                  
          }
      */
      const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({"aqt":Array.from(ingredients.keys()).reduce((acc, ingredient)=> acc + " " + ingredient)})
      };

      fetch("/research_recipe", requestOptions)
          .then(response => response.json())
          .then(data => changement(data))
    }

    function changement(data) {
      let filters_list = Object.values(data);
      let filters_map = filters_list.map((data)=> 
            <Filter id={filters_list.indexOf(data)} apiCall={apiCall} category={data} />
      )
      setFilters(filters_map);
      setdata({
        budget: data.budget,
        cook_time: data.cook_time,
        difficulty: data.difficulty,
        ingredients: data.ingredients,
        name: data.name,
        nb_comments : data.nb_comments,
        prep_time : data.prep_time,
        rate: data.rate,
        recipe_quantity : data.recipe_quantity,
        steps: data.steps, 
        total_time: data.total_time

    })}
    const viewIngredients = fridge_state === "close" ? "" : ingredientsComponent;
    const viewTemplate = 
                <div> 
                  <p>{filters}</p>
                  <p>name: {data.name}</p>
                  <p>budget: {data.budget}</p>
                  <p>cook_time: {data.cook_time}</p>
                  <p>difficulty: {data.difficulty}</p>
                  <p>ingredients: {data.ingredients}</p>
                  <p>nb_comments : {data.nb_comments}</p>
                  <p>prep_time : {data.prep_time}</p>
                  <p>rate: {data.rate}</p>
                  <p>recipe_quantity : {data.recipe_quantity}</p>
                  <p>steps: {data.steps}</p>
                  <p>total_time: {data.total_time}</p>
                </div>
    const row_style = {
      backgroundColor : "red",
      flexDirection : "row",
    }

    

    return (
        <div className="App">
            <header className="App-header">   
              <div id="row" style={row_style}>
                <div id="column1">
                  <h1>React and flask</h1>
                  <Fridge changeFridgeState={changeFridgeState}/>
                  {viewIngredients}
                  <SearchBar addIngredient = {addIngredient} apiCall={apiCall} />
                </div>
                <p>Bob</p>
                <div id="column2">
                  <span>{data.name === 0 ? "" : viewTemplate}</span>
                </div>
              </div>
            </header>
        </div>
    );
}
 
export default App;