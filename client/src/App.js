import React, { useState } from "react";
import SearchBar from "./SearchBar";
import Filter from "./Filter";
import Fridge from "./Fridge";

function App() {
    const [searchBarText, setSearchBarText] = useState("");
    const [filters, setFilters] = useState("");
    const [data, setdata] = useState({
      budget: 0,
      cook_time: 0,
      difficulty: 0,
      ingredients: 0,
      name: 0,
      nb_comments : 0,
      prep_time : 0,
      rate: 0,
      recipe_quantity : 0,
      steps: 0, 
      total_time: 0
    });

    function apiCall(donnees) {
      setSearchBarText(donnees["aqt"]);
      // POST request using fetch inside useEffect React hook
      /*
      const donnees = {
          "aqt": "boeuf bourguignon",  
          "dt": "platprincipal",      
          "exp": 2,                   
          "dif": 2,                   
          "veg": 0,                  
          }
      */
     console.log(donnees)
      const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(donnees)
      };
      fetch("/data", requestOptions)
          .then(response => response.json())
          .then(data => changement(data))
  
  // empty dependency array means this effect will only run once (like componentDidMount in classes)
  }

    

    function changement(data) {
      let filter_map = Object.values(data).map((data)=> 
            <Filter apiCall={apiCall} ingredient={searchBarText} category={data} />
      )
      setFilters(filter_map);
      setdata({
        budget: data.budget,
        cook_time: data.cook_time,
        difficulty: data.difficulty,
        ingredients: data.ingredients,
        name: data.name,
        nb_comments : data.nb_comments,
        prep_time : data.prep_time,
        rate: data.rate,
        recipe_quantity : data.recipe_quantity,
        steps: data.steps, 
        total_time: data.total_time

    })}

    const viewTemplate = 
                <div> 
                  <p>{filters}</p>
                  <p>name: {data.name}</p>
                  <p>budget: {data.budget}</p>
                  <p>cook_time: {data.cook_time}</p>
                  <p>difficulty: {data.difficulty}</p>
                  <p>ingredients: {data.ingredients}</p>
                  <p>nb_comments : {data.nb_comments}</p>
                  <p>prep_time : {data.prep_time}</p>
                  <p>rate: {data.rate}</p>
                  <p>recipe_quantity : {data.recipe_quantity}</p>
                  <p>steps: {data.steps}</p>
                  <p>total_time: {data.total_time}</p>
                </div>

    

    return (
        <div className="App">
            <header className="App-header">
                
                <h1>React and flask</h1>
                {/* Calling a data from setdata for showing */}
                <Fridge />
                <SearchBar apiCall={apiCall} />
                <span>{data.name === 0 ? "" : viewTemplate}</span>
                
 
            </header>
        </div>
    );
}
 
export default App;