import ReturnPreviousPageButton from "../components/buttons/buttonToPreviousPage";

type RecipePageProps = {}

const RecipePage: React.FC<RecipePageProps> = () => {

    return (
        <>
            <div>
                Je suis sur recipe_page
            </div>
            <ReturnPreviousPageButton />
        </>
    )
}

export default RecipePage;