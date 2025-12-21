import React from "react";
import { useSelector } from "react-redux";
import HomePage from "./pages/HomePage";
import MainPage from "./pages/MainPage";
import FavoritePage from "./pages/FavoritesPage";
import RecipePage from "./pages/RecipePage";
import { Provider } from "react-redux";
import { RootState, store } from "./store/store";

import "./styles/App.css";

const Page: React.FC = () => {
    const page = useSelector((state: RootState) => state.page.value);
    
    const renderPage = () => {
        switch (page) {
            case "home_page":
                return <HomePage />
            case "main_page":
                return <MainPage />
            case "favorites_page":
                return <FavoritePage />
            case "recipe_page":
                return <RecipePage/>
            default:
                return <HomePage />
        };
    }
    return (
        renderPage()
    )
}

// Possible page types definition
const App: React.FC = () => {
    return (
        <Provider store={store}>
            <div className="App">
                <header className="App-header">   
                    <div className="container-app">
                        <Page /> 
                    </div>
                </header>
            </div>
        </Provider>
    );
};

export default App;
