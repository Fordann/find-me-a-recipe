import React, {useState} from "react";
import HomePage from "./pages/HomePage";
import MainPage from "./pages/MainPage";
import "./styles/App.css"

function App() {
    const [pageState, setPageState] = useState("home_page");

    return (
        <div className="App">
            <header className="App-header">   
                <div className="container-app">
                    <h1>React and flask</h1>
                    {
                    (pageState === "home_page") ?
                        <HomePage switchPage={(page)=>setPageState(page)}></HomePage>
                    : 
                        <MainPage switchPage={(page)=>setPageState(page)}></MainPage>   
                    }
                </div>
            </header>
        </div>
    );
}
 
export default App;