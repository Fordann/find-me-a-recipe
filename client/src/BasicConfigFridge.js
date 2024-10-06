import React, {useContext}from "react";
import ResponsiveButton from "./ResponsiveButton";
import "./styles/BasicConfigFridge.css";


function BasicConfigFridge(props) {

    return (
        <ResponsiveButton className="btn_config" value={props.value} onClick={()=> props.click(props.value)}>
            {props.value} 
        </ResponsiveButton>
    )


}

export default BasicConfigFridge;
