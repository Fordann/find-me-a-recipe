import React, { useState } from "react";
import "../styles/Ingredient.css";

interface IngredientProps {
    image: string;
    quantity: number;
    updateQuantityIngredient: (newQuantity: number) => void;
    name?: string; // optional descriptive name for alt text
}

const Ingredient: React.FC<IngredientProps> = ({ image, quantity, updateQuantityIngredient, name }) => {
    const [isQuantityDisplayed, setIsQuantityDisplayed] = useState<boolean>(false);

    return (
        <div className="ingredient-item">
            <img 
                id="close" 
                src={image} 
                onClick={() => setIsQuantityDisplayed(!isQuantityDisplayed)} 
                alt={name ? name : ""} // meaningful alt when available, empty if decorative
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
