import React, { useState } from "react";
import HomePage from "./pages/HomePage";
import MainPage from "./pages/MainPage";
import "./styles/App.css";

// Définition des types de pages possibles
type PageState = "home_page" | "main_page";

const App: React.FC = () => {
    const [pageState, setPageState] = useState<PageState>("home_page");

    return (
        <div className="App">
            <header className="App-header">   
                <div className="container-app">
                    <h1>React and Flask</h1>
                    {
                        pageState === "home_page" ? (
                            <HomePage switchPage={(page: PageState) => setPageState(page)} />
                        ) : (
                            <MainPage />
                        )
                    }
                </div>
            </header>
        </div>
    );
};

export default App;
