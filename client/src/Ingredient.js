import React from "react";


function Ingredient(props) {
    let quantity = 0;
    const mystyle = {
        position : "absolute",
        top :"17%",
        left :"14%",
        width: "4%",
        height: "auto",
      };

    function changeQuantity() {
        quantity = <button style={mystyle} onClick={()=> console.log("bib")}>+</button>;
        console.log("bob");
    }
    return (
        <>
            <img style={mystyle} id="close" src={props.image} onClick={() =>changeQuantity()} alt="Logo"></img>
            <span style={mystyle} >{quantity}</span>
            
        </>
    )
}

export default Ingredient;