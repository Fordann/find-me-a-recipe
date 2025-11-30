import React from "react";
import MainPage from "./pages/MainPage";
import HomePage from "./pages/HomePage";
import { LanguageProvider } from "./contexts/LanguageContext";
import "./styles/App.css";

// Possible page types definition
const App: React.FC = () => {
    const [page, setPage] = React.useState<"home_page"|"main_page">("home_page");
    return (
        <LanguageProvider>
            <div className="App">
                <header className="App-header">   
                    <div className="container-app">
                        {page === "home_page" ? (
                            <HomePage switchPage={setPage} />
                        ) : (
                            <MainPage />
                        )}
                    </div>
                </header>
            </div>
        </LanguageProvider>
    );
};

export default App;
