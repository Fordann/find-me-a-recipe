import { useState, useEffect } from "react";
import { useTranslation } from "../../store/slices/language/LanguageExtension";
import { navigate } from "../../store/slices/PageSlice";
import { useDispatch } from "react-redux";
import useFavoriteRecipes from "../../hooks/favorites";

const ButtonToFavorites: React.FC = () => {
    const t = useTranslation();
    const dispatch = useDispatch();
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
                <button type="button" className="btn_favorites" onClick={()=> dispatch(navigate('favorites_page'))}>
                {t('button.myFavorites')} {numberOfFavoritesRecipe ? `(${numberOfFavoritesRecipe})` : ''}
            </button>
        </div>
    )
}

export default ButtonToFavorites;