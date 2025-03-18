import React, { useRef, useState } from "react";
import FridgeImageSVG from './images/frigo.svg';

import "./styles/Fridge.css";

// Définition des types des props
type FridgeProps = {
    onClick: () => void;
};

const Fridge: React.FC<FridgeProps> = ({ onClick }) => {
    const [fridgeState, setFridgeState] = useState<"open" | "closed">("closed");
    const fridgeRef = useRef<SVGSVGElement | null>(null);

    const changeFridgeState = () => {
        if (!fridgeRef.current) return;

        // Recherche des éléments SVG en utilisant querySelector
        const fridgeGroup = fridgeRef.current.querySelector<SVGGElement>("#fridge_closed, #fridge_open");
        const doorGroup = fridgeRef.current.querySelector<SVGGElement>("#door, #door_closed, #door_open");

        if (fridgeGroup && doorGroup) {
            if (fridgeState === "open") {
                setFridgeState("closed");
                fridgeGroup.id = "fridge_closed";
                doorGroup.id = "door_closed";
            } else {
                setFridgeState("open");
                fridgeGroup.id = "fridge_open";
                doorGroup.id = "door_open";
            }
        }
    };

    return (
        <div className="fridge_container">
            <FridgeImageSVG
                ref={fridgeRef}
                width="100%"
                className="fridge_svg"
                onClick={() => {
                    onClick();
                    changeFridgeState();
                }}
            />
        </div>
    );
};

export default Fridge;
