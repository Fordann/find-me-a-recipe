import ReturnPreviousPageButton from "../components/buttons/buttonToPreviousPage";
import ButtonToRecipePage from "../components/buttons/buttonToRecipes";

type FavoritePageProps = {
}

const FavoritePage: React.FC<FavoritePageProps> = () => {
    return (
        <>
            <div>
                Favorite Page
            </div>
            <ButtonToRecipePage />
            <ReturnPreviousPageButton />
        </>
        
    )
}

export default FavoritePage;