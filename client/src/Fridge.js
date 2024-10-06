import React, {useRef, useState} from "react";
import {ReactComponent as FridgeImageSVG} from "./images/frigo.svg"
import "./styles/Fridge.css"




function Fridge(props) {
    const [fridge_state, setFridgeState] = useState("close");
    const fridgeRef = useRef(null);

    
    
    function changeFridgeState() {
        const fridge_group = fridgeRef.current.querySelector("g#fridge_closed, g#fridge_open");
        const door_group = fridgeRef.current.querySelector("g#door, g#door_closed, g#door_open");

        if (fridge_state === "open") {
            setFridgeState("closed");
            fridge_group.id = "fridge_closed";   
            door_group.id = "door_closed";
        } 
        else {
            setFridgeState("open");
            fridge_group.id = "fridge_open"; 
            door_group.id = "door_open";
        }
        
    }
    return (
        <div class="fridge_container">
            <FridgeImageSVG 
                ref={fridgeRef}
                width="100%" 
                className="fridge_svg"
                onClick={()=>{
                    props.onClick();
                    changeFridgeState();}}/>
        </div>) 
}


export default Fridge;