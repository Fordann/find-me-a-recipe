import React from "react";
import fridge_close from "./images/fridge_close.jpg"
import fridge_open from "./images/fridge_open.jpg"
function Fridge(props) {
  return <img id="close" src={fridge_close} alt="Logo" 
    onMouseOver={e => {
        e.currentTarget.src = fridge_open;
    }}
    onMouseOut={e => {
        e.currentTarget.src = fridge_close;
    }}/>;
}

export default Fridge;