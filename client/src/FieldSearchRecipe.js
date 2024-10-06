import React, {useState} from "react";
import FilterButton from "./components/FilterButton";
import Recipe from "./components/Recipe";
import ResponsiveButton from "./components/ResponsiveButton";
import "./styles/FieldSearchRecipe.css"

function FieldSearchRecipe(props) {
    const [recipes, setRecipes] = useState([]);
    const [recipe_choosen, setRecipeChoosen] = useState(false);
    const [recipe, setRecipe] = useState("");



    function display_recipe(recipes) {
        setRecipes(recipes);
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
        console.log(props.ingredients);
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },

            body: JSON.stringify({"aqt": props.ingredients.reduce((acc, ingredient)=> acc + " " + ingredient.value)})
        };


        fetch("/research_recipe", requestOptions)
            .then(response => response.json())
            .then(data => display_recipe(data))
    }


    function searchRecipe(recipe_name) {
        console.log(recipe_name);
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },

            body: JSON.stringify({"aqt":recipe_name})
        };


        fetch("/detailed_recipe", requestOptions)
            .then(response => response.json())
            .then(_recipe => {
                setRecipe({
                    name:_recipe.name,
                    image:_recipe.images,
                    budget: _recipe.budget,
                    cook_time: _recipe.cook_time,
                    difficulty: _recipe.difficulty,
                    ingredients: _recipe.ingredients,
                    nb_comments : _recipe.nb_comments,
                    prep_time : _recipe.prep_time,
                    rate: _recipe.rate,
                    recipe_quantity : _recipe.recipe_quantity,
                    steps: _recipe.steps, 
                    total_time: _recipe.total_time 
            });
                setRecipeChoosen(true);
            })
    }


    return (
        <>
        {
        !recipe_choosen ? 
            <div className="search mouse-hover container">
                <button className="search_recipe_button" onClick={apiCall}>Search Recipe</button>
                <div className="filter_btns">
                    <FilterButton value="végé"></FilterButton>
                    <FilterButton value="carnivore"></FilterButton>
                    <FilterButton value="sans tomate"></FilterButton>
                    <FilterButton value="sans lactose"></FilterButton>
                    <FilterButton value="avec gingembre"></FilterButton>
                    <ResponsiveButton value="bob" onClick={()=>console.log("bob")}></ResponsiveButton>
                </div>
                <>
                    {recipes.map((_recipe)=> <ResponsiveButton value={_recipe} onClick={()=>searchRecipe(_recipe)}/>)}
                </>
            </div>
            :
            <div className="recipe">
                <Recipe value={recipe}/>
            </div>
        }
        </>
    )


}

export default FieldSearchRecipe;
