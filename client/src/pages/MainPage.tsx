import React from "react";
import RecipeFetcher from "../components/RecipeFetcher";
import { SearchBarIngredients } from "../components";
import ButtonToFavorites from "../components/buttons/buttonToFavorites";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

type MainPageProps = {

}

const MainPage: React.FC<MainPageProps> = () => {
    const ingredientChosenByUser = useSelector((state: RootState) => state.ingredient.value)
    
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
