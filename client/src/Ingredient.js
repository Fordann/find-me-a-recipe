import React from "react";

function Ingredient(props) {

    return (
        <div>
            <p>{props.value}</p>;
            <img id="close" src={props.image} alt="Logo"></img>
        </div>
    )
}

export default Ingredient;