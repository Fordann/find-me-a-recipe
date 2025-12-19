import  { useNavigation } from "../contexts/PageContext";
type RecipePageProps = {}

const RecipePage: React.FC<RecipePageProps> = () => {
    const switchPage = useNavigation();

    return (
        <>
            <div>
                Je suis sur recipe_page
            </div>
            <button onClick={() => switchPage("main_page")}>go to main</button>
        </>
    )
}

export default RecipePage;