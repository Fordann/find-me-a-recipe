import React from "react";

// Props type definition
interface StyledButtonProps {
  className?: any; // `className` est optionnel
  onClick: () => any; // Event function type
  value: any; // Le texte du bouton
}

const StyledButton: React.FC<StyledButtonProps> = (props) => {
  const className = props.className ?? 'btn_search_with_ingredients';
  return (
    <button className={className} onClick={props.onClick}>
      {props.value}
    </button>
  );
};

export default StyledButton;
