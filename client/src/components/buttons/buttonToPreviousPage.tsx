import { useLanguage } from "../../contexts/LanguageContext";
import { useNavigation, useNavigationBack} from "../../contexts/PageContext"

const ReturnPreviousPageButton: React.FC = () => {
    const switchToPreviousPage = useNavigationBack();
    const {t} = useLanguage();

    return (
        <div className="action-row" style={{ pointerEvents: 'auto', transition: 'opacity 0.6s ease, transform 0.6s ease', transform: 'scale(1)' }}>
            <button type="button" className="btn_previous_page" onClick={()=> switchToPreviousPage()}>
                {t('button.previousPage')}
            </button>
        </div>
    )
}

export default ReturnPreviousPageButton;