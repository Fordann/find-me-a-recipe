import React, {useState, useEffect, useContext} from "react";
import ContainerContext from "./FieldAddingIngredients";

function ResponsiveButton(props) {
    const [fontSize, setFontSize] = useState('16px');
    const ref_container = useContext(ContainerContext);


    /*function adjustFontSize() {
        console.log(ref_container);
        const container = ref_container.querySelector('.add_ingredients');
        const containerWidth = container.offsetWidth;
        
        if (containerWidth > 800) {
            setFontSize('16px');
        } else if (containerWidth > 500) {
            setFontSize('14px');
        } else {
            setFontSize('12px');
        }
    };

    useEffect(() => {
        // Ajuste initial
        adjustFontSize();

        // Écouteur d'événements pour le redimensionnement
        window.addEventListener('resize', adjustFontSize);

        // Nettoyage de l'écouteur lors du démontage du composant
        return () => {
            window.removeEventListener('resize', adjustFontSize);
        };
    }, []);*/   
    return (
        <button className={props.className} onClick={props.onClick}>
            {props.text} 
        </button>
    )


}

export default ResponsiveButton;
