import React from "react";
import HomePage from "./pages/HomePage";
import MainPage from "./pages/MainPage";
import FavoritePage from "./pages/FavoritesPage";
import RecipePage from "./pages/RecipePage";
import { LanguageProvider } from "./contexts/LanguageContext";
import { NavigationProvider, useCurrentPage } from "./contexts/PageContext";
import "./styles/App.css";

const Page: React.FC = () => {
    const page = useCurrentPage();
    
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
        <LanguageProvider>
            <div className="App">
                <header className="App-header">   
                    <div className="container-app">
                        <NavigationProvider>
                            <Page /> 
                        </NavigationProvider>
                    </div>
                </header>
            </div>
        </LanguageProvider>
    );
};

export default App;
