import React from "react";

// Typage des props
interface FilterButtonProps {
  value: string; // La valeur du bouton est une chaîne de caractères
}

const FilterButton: React.FC<FilterButtonProps> = (props) => {
  return (
    <button onClick={() => console.log("click")}>
      {props.value}
    </button>
  );
};

export default FilterButton;
