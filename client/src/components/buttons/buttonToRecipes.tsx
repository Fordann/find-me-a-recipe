import { navigate } from "../../store/slices/PageSlice";
import { useDispatch } from "react-redux";

const ButtonToRecipePage: React.FC = () => {
    const dispatch = useDispatch();

    return (
        <div className="action-row" style={{ pointerEvents: 'auto', transition: 'opacity 0.6s ease, transform 0.6s ease', transform: 'scale(1)' }}>
                <button type="button" className="btn_favorites" onClick={()=> dispatch(navigate('recipe_page'))}>
                {"button to recipe page"}
            </button>
        </div>
    )
}

export default ButtonToRecipePage;