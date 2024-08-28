import { useState } from "react";


function SearchBar(props) {
    const [word, setWord] = useState(props.value);

    function handleChange(event) {
        event.preventDefault();
        setWord(event.target.value); 
      }

      
  
    return (
      <div>
        <p>Type ingredients, click the add button and enjoy your recipe</p>
        <form >
          <input
            type="text"
            id="search-bar"
            className="input input__lg"
            name={word}
            autoComplete="on"
            onChange={handleChange}
          />
          <button type="button"
          className="btn btn__primary btn__lg"
          onClick={()=> {
              
              props.apiCall({"aqt":word});
              document.getElementById("search-bar").value="";
              
              }}>
            Add
          </button>
        </form>
      </div>
    );
  }


  
  export default SearchBar;