import React, { useState } from "react";
import "./styles/Ingredient.css";

// Définition du type des props
interface IngredientProps {
    image: string;
    quantity: number;
    updateQuantityIngredient: (newQuantity: number) => void;
}


const Ingredient: React.FC<IngredientProps> = ({ image, quantity, updateQuantityIngredient }) => {
    const [isQuantityDisplayed, setIsQuantityDisplayed] = useState<boolean>(false);

    return (
        <div className="ingredient-item">
            <img 
                id="close" 
                src={image} 
                onClick={() => setIsQuantityDisplayed(!isQuantityDisplayed)} 
                alt="Ingredient image"
            />
            {isQuantityDisplayed && (
                <div className="ingredient-quantity">
                    <span>{quantity}</span>
                    <button className="ingredient-button" onClick={() => updateQuantityIngredient(quantity + 1)}>+</button>
                    <button className="ingredient-button" onClick={() => updateQuantityIngredient(quantity - 1)}>-</button>
                </div>
            )}
        </div>
    );
};

export default Ingredient;
