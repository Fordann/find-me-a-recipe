import React from "react";
import {ReactComponent as FridgeImage} from "./images/frigo.svg"
import "./styles/Fridge.css"

function Fridge(props) {
    return (
        <div class="fridge_container">
            <FridgeImage className="fridge_svg" id="close"
                onClick={e => {
                    props.changeFridgeState(e.currentTarget);
                }}/>;
        </div>) 
    
}

export default Fridge;