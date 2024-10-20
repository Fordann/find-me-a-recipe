import React from "react";

function Recipe(props) {
    const recipe = props.value;
    console.log(recipe.image[0].split(",")[0].split(" ")[0])
    return (
        <>  
            <h2>{recipe.name}</h2>
            <img width="100%" src={recipe.image[0].split(",")[0].split(" ")[0]} alt="logo"/>
            <div className="recipe_item"> 
                <div className="global-overview-recipe">
                    <p>recipe_quantity : {recipe.recipe_quantity}</p>
                    <p>difficulty: {recipe.difficulty}</p>
                    <p>budget: {recipe.budget}</p>
                </div>
                
                <div className="time-recipe">
                    <p>prep_time : {recipe.prep_time}</p>
                    <p>cook_time: {recipe.cook_time}</p>
                    <p>total_time: {recipe.total_time}</p>
                </div>
                

                <div className="ingredients-recipe">
                    <p>ingredients:</p>
                    {recipe.ingredients}
                </div>
                
                <p>steps:</p>
                {recipe.steps}
                
            </div>
        </>
    )
}

export default Recipe;
