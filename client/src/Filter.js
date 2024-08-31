import React from "react";

function Filter(props) {
    

    return (
        <button onClick={() => console.log("click")}>
            {props.category} 
        </button>
    )


}

export default Filter;
