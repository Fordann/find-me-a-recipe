import React from "react";

// Définir les types des propriétés de la recette
interface RecipeProps {
  value: {
    name: string;
    image: string;
    budget: string;
    cook_time: string;
    difficulty: string;
    ingredients: string[];
    nb_comments: number;
    prep_time: string;
    rate: number;
    recipe_quantity: string;
    steps: string[];
    total_time: string;
  };
}

const Recipe: React.FC<RecipeProps> = (props) => {
  const recipe = props.value;

  // Traiter l'image pour l'affichage
  //const imageSrc = recipe.image[0].split(",")[0].split(" ")[0];

  return (
    <>
      <h2>{recipe.name}</h2>
      <img width="100%" src={recipe.image} alt="recipe" />
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
  );
};

export default Recipe;
