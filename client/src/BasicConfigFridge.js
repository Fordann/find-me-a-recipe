import React, {useContext}from "react";
import ResponsiveButton from "./ResponsiveButton";
import "./styles/BasicConfigFridge.css";


function BasicConfigFridge(props) {

    return (
        <ResponsiveButton className="btn_config" text={props.text} onClick={props.click}>
            {props.text} 
        </ResponsiveButton>
    )


}

export default BasicConfigFridge;
