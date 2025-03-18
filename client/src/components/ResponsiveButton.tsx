import React from "react";

// Définition du type pour les props
interface ResponsiveButtonProps {
  className?: any; // `className` est optionnel
  onClick: () => any; // Fonction de type événement
  value: any; // Le texte du bouton
}

const ResponsiveButton: React.FC<ResponsiveButtonProps> = (props) => {
  return (
    <button className={props.className} onClick={props.onClick}>
      {props.value}
    </button>
  );
};

export default ResponsiveButton;
