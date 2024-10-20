import React, {useEffect, useState} from "react";
import "./styles/Ingredient.css";

function Ingredient(props) {
    const [isQuantityDisplayed, setIsQuantityDisplayed] = useState(false);

    return (
        <div className="ingredient-item">
            <img id="close" src={props.image} onClick={()=>setIsQuantityDisplayed(!isQuantityDisplayed)} alt="Logo"></img>
            {
            isQuantityDisplayed ? 
                <div className="ingredient-quantity">
                    <span>{props.quantity}</span>
                    <button className="ingredient-button" onClick={()=>props.updateQuantityIngredient(props.quantity + 1)}>+</button>
                    <button className="ingredient-button" onClick={()=>props.updateQuantityIngredient(props.quantity - 1)}>-</button>
                </div>
            :
            <></>
            } 
        </div>
    )
}

export default Ingredient;