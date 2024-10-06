import React, {useEffect, useState} from "react";
import "./styles/Ingredient.css";

function Ingredient(props) {

    return (
        <div className="ingredient-item">
            <img id="close" src={props.image} alt="Logo"></img>
            <span>{props.quantity}</span>
            <button onClick={()=>props.updateQuantityIngredient(props.quantity + 1)}>+</button>
            <button onClick={()=>props.updateQuantityIngredient(props.quantity - 1)}>-</button>
            
        </div>
    )
}

export default Ingredient;