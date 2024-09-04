import React from "react";
import fridge_close from "./images/fridge_close.jpg"

function Fridge(props) {
    let ingredient_spot_in_fridge = [[], [], [], [], [], [], [], []]

    return <img id="close" src={fridge_close} alt="Logo" 
    onClick={e => {
        props.changeFridgeState(e.currentTarget);
    }}/>;
}

export default Fridge;