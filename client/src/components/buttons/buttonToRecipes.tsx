import { useLanguage } from "../../contexts/LanguageContext";
import { useNavigation } from "../../contexts/PageContext";

const ButtonToRecipePage: React.FC = () => {
    const switchPage = useNavigation();

    return (
        <div className="action-row" style={{ pointerEvents: 'auto', transition: 'opacity 0.6s ease, transform 0.6s ease', transform: 'scale(1)' }}>
                <button type="button" className="btn_favorites" onClick={()=> switchPage('recipe_page')}>
                {"button to recipe page"}
            </button>
        </div>
    )
}

export default ButtonToRecipePage;