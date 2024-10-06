import React from "react";

function Recipe(props) {
    const recipe = props.value;
    console.log(recipe.image[0].split(",")[0].split(" ")[0])
    return (
        <>
            <img width="100%" src={recipe.image[0].split(",")[0].split(" ")[0]} alt="logo"/>
            <div className="recipe_item"> 
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
        </>
    )
}

export default Recipe;
