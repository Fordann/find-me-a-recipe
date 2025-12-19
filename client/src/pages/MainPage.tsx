import React, { useState, useEffect } from "react";
import RecipeFetcher from "../components/RecipeFetcher";
import { SearchBarIngredients } from "../components";
import { useNavigation } from "../contexts/PageContext";
import useFavoriteRecipes from "../hooks/favorites";
import { useLanguage } from "../contexts/LanguageContext";
import {FieldSearchRecipe} from "../components";

type MainPageProps = {

}
const MainPage: React.FC<MainPageProps> = () => {
    const { t } = useLanguage();
    const switchPage = useNavigation();
    const {getNumberOfFavoritesRecipe} = useFavoriteRecipes();
    const [ingredientChosenByUser, setIngredientChosenByUser] = useState<string>("");
    const [numberOfFavoritesRecipe, setNumberOfFavoritesRecipe] = useState<number>(0);

    useEffect(() => {
        const result = async () => {
            const number = await getNumberOfFavoritesRecipe();
            setNumberOfFavoritesRecipe(number);
        };
        result();
    }, [getNumberOfFavoritesRecipe]);

    return (
            <>  
                <RecipeFetcher
                    ingredientChosenByUser={ingredientChosenByUser}
                />
                { !ingredientChosenByUser &&
                    <div className="add_ingredients mouse-hover container">  
                        <SearchBarIngredients 
                            setIngredientToSearch={setIngredientChosenByUser}
                        />
                        <div className="action-row" style={{ pointerEvents: 'auto', transition: 'opacity 0.6s ease, transform 0.6s ease', transform: 'scale(1)' }}>
                                
                                <button type="button" className="btn_favorites" onClick={()=> switchPage('favorites_page')}>
                                {t('button.myFavorites')} {numberOfFavoritesRecipe ? `(${numberOfFavoritesRecipe})` : ''}
                            </button>
                        </div>
                    </div>
                }  
            </>
    );
};

export default MainPage;
