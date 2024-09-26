import React from "react";


function Ingredient(props) {
    let quantity = 0;

    
      function changeQuantityIngredient(ingredient, quantity) {
      /*
        let new_quantity_ingredients = {...ingredients};
        new_quantity_ingredients[ingredient] = quantity;
        setIngredients(new_quantity_ingredients);
        */
    }
        

    function changeQuantity() {
        quantity = <button onClick={changeQuantityIngredient}>+</button>;
    }

    function decreaseQuantity() {

    }

    function increaseQuantity() {

    }
    return (
        <>
            <img id="close" src={props.image} onClick={() =>changeQuantity()} alt="Logo"></img>
            <span>{quantity}</span>
            <button onClick={increaseQuantity}>+</button>
            <button onClick={decreaseQuantity}>-</button>
            
        </>
    )
}

export default Ingredient;