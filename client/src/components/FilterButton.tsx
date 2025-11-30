import React from "react";

// Typage des props
interface FilterButtonProps {
  value: string; // Button value is a string
}

const FilterButton: React.FC<FilterButtonProps> = (props) => {
  return (
    <button onClick={() => console.log("click")}>
      {props.value}
    </button>
  );
};

export default FilterButton;
