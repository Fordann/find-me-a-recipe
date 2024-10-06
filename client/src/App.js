import React from "react";
import FieldAddingIngredients from "./FieldAddingIngredients";
import "./styles/App.css"

function App() {
    return (
        <div className="App">
            <header className="App-header">   
                <div className="container-app">
                  <h1>React and flask</h1>
                  <FieldAddingIngredients />
                </div>
            </header>
        </div>
    );
}
 
export default App;