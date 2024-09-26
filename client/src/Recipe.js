import React from "react";

function Recipe(props) {
    return (
        <button onClick={() => console.log("click")}>
            {props.name} 
        </button>
    )
}

export default Recipe;
