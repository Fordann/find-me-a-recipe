import React, {useState} from "react";
import FilterButton from "./FilterButton";
import Recipe from "./Recipe";
import ResponsiveButton from "./ResponsiveButton";
import "./styles/FieldSearchRecipe.css"

function FieldSearchRecipe(props) {
    const [statePage, setStatePage] = useState("research_not_started");
    const [recipe, setRecipe] = useState("");
    const [ingredients, setIngredients] = useState("");

    function display_recipe() {
        setRecipe({
            budget: recipe.budget,
            cook_time: recipe.cook_time,
            difficulty: recipe.difficulty,
            ingredients: recipe.ingredients,
            name: recipe.name,
            nb_comments : recipe.nb_comments,
            prep_time : recipe.prep_time,
            rate: recipe.rate,
            recipe_quantity : recipe.recipe_quantity,
            steps: recipe.steps, 
            total_time: recipe.total_time
    
    })}
    


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
            .then(data => display_recipe(data))
    }


    function SearchRecipe() {
        setStatePage("research_started");
        apiCall();
    }

    const viewTemplate = 
                <div> 
                  <p>name: {recipe.name}</p>
                  <p>budget: {recipe.budget}</p>
                  <p>cook_time: {recipe.cook_time}</p>
                  <p>difficulty: {recipe.difficulty}</p>
                  <p>ingredients: {recipe.ingredients}</p>
                  <p>nb_comments : {recipe.nb_comments}</p>
                  <p>prep_time : {recipe.prep_time}</p>
                  <p>rate: {recipe.rate}</p>
                  <p>recipe_quantity : {recipe.recipe_quantity}</p>
                  <p>steps: {recipe.steps}</p>
                  <p>total_time: {recipe.total_time}</p>
                </div>


    


    return (
        <div className="search mouse-hover container">
            <button className="search_recipe_button" onClick={SearchRecipe}>Search Recipe</button>
            <div className="filter_btns">
                <FilterButton value="végé"></FilterButton>
                <FilterButton value="carnivore"></FilterButton>
                <FilterButton value="sans tomate"></FilterButton>
                <FilterButton value="sans lactose"></FilterButton>
                <FilterButton value="avec gingembre"></FilterButton>
                <ResponsiveButton value="bob" onClick={()=>console.log("bob")}></ResponsiveButton>
            </div>
        </div>
    )


}

export default FieldSearchRecipe;
