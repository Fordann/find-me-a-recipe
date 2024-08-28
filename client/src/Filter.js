import React, { useState } from "react";

function Filter(props) {
    

    return (
        <button onClick={() => props.apiCall({"aqt":String(props.category + " " + props.ingredient)})}>
            {props.category} 
        </button>
    )


}

export default Filter;
