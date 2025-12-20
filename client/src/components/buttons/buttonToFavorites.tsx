import { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useNavigation } from "../../contexts/PageContext";
import useFavoriteRecipes from "../../hooks/favorites";

const ButtonToFavorites: React.FC = () => {
    const { t } = useLanguage();
    const switchPage = useNavigation();
    const {getNumberOfFavoritesRecipe} = useFavoriteRecipes();
    const [numberOfFavoritesRecipe, setNumberOfFavoritesRecipe] = useState<number>(0);

    useEffect(() => {
        const result = async () => {
            const number = await getNumberOfFavoritesRecipe();
            setNumberOfFavoritesRecipe(number);
        };
        result();
    }, [getNumberOfFavoritesRecipe]);

    return (
        <div className="action-row" style={{ pointerEvents: 'auto', transition: 'opacity 0.6s ease, transform 0.6s ease', transform: 'scale(1)' }}>
                <button type="button" className="btn_favorites" onClick={()=> switchPage('favorites_page')}>
                {t('button.myFavorites')} {numberOfFavoritesRecipe ? `(${numberOfFavoritesRecipe})` : ''}
            </button>
        </div>
    )
}

export default ButtonToFavorites;