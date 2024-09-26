import React from "react";
import FieldAddingIngredients from "./FieldAddingIngredients";
import FieldSearchRecipe from "./FieldSearchRecipe";
import "./styles/App.css"

function App() {
    return (
        <div className="App">
            <header className="App-header">   
                <div className="container-app">
                  <h1>React and flask</h1>
                  <FieldAddingIngredients />
                  <FieldSearchRecipe />
                </div>
            </header>
        </div>
    );
}
 
export default App;