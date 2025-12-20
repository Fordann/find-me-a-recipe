import React, { useState} from "react";
import RecipeFetcher from "../components/RecipeFetcher";
import { SearchBarIngredients } from "../components";
import ButtonToFavorites from "../components/buttons/buttonToFavorites";
import { useIngredient } from "../contexts/IngredientContext";

type MainPageProps = {

}

const MainPage: React.FC<MainPageProps> = () => {
    const ingredientChosenByUser = useIngredient();
    return (
            <>  
                <RecipeFetcher />

                { !ingredientChosenByUser &&
                    <div className="add_ingredients mouse-hover container">  
                        <SearchBarIngredients />
                    </div>
                }  
                <ButtonToFavorites />
            </>
    );
};

export default MainPage;
