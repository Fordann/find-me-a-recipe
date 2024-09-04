import React from "react";

function Ingredient(props) {
    const mystyle = {
        position : "absolute",
        top :"-19%",
        width: "50px",
        height :"50px",
        padding: "14%",
      };
    return (
        <div >
            <img style={mystyle} id="close" src={props.image} alt="Logo"></img>
        </div>
    )
}

export default Ingredient;