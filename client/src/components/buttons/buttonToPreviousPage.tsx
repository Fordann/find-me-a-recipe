import { useTranslation } from "../../store/slices/language/LanguageExtension";
import { navigateBack } from "../../store/slices/PageSlice";
import { useDispatch } from "react-redux";

const ReturnPreviousPageButton: React.FC = () => {
    const t = useTranslation();
    const dispatch = useDispatch();

    return (
        <div className="action-row" style={{ pointerEvents: 'auto', transition: 'opacity 0.6s ease, transform 0.6s ease', transform: 'scale(1)' }}>
            <button type="button" className="btn_previous_page" onClick={()=> dispatch(navigateBack())}>
                {t('button.previousPage')}
            </button>
        </div>
    )
}

export default ReturnPreviousPageButton;