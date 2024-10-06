import React from "react";

function FilterButton(props) {
    return (
        <button onClick={() => console.log("click")}>
            {props.value    } 
        </button>
    )


}

export default FilterButton;
