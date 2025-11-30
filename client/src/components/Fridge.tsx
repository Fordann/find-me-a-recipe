import React, { useEffect, useRef, useState } from "react";
import { ReactComponent as FridgeImageSVG } from '../images/frigo.svg';

import "../styles/Fridge.css";

type FridgeProps = {
    isLoading?: boolean;
};

const Fridge: React.FC<FridgeProps> = ({ isLoading = false }) => {
    const [fridgeState, setFridgeState] = useState<"open" | "closed">("closed");
    const fridgeRef = useRef<SVGSVGElement | null>(null);
    const toggleTimerRef = useRef<number | null>(null);

    const changeFridgeState = () => {
        if (!fridgeRef.current) return;

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

    // While loading, repeatedly toggle open/close using the same animation as click
    useEffect(() => {
        if (isLoading) {
            // Ensure starting state
            setFridgeState("closed");
            // Start toggling
            toggleTimerRef.current = window.setInterval(() => {
                changeFridgeState();
            }, 700); // match CSS transition ~1s but slightly faster
        } else {
            // Stop toggling and return to closed
            if (toggleTimerRef.current) {
                clearInterval(toggleTimerRef.current);
                toggleTimerRef.current = null;
            }
            if (fridgeRef.current) {
                const fridgeGroup = fridgeRef.current.querySelector<SVGGElement>("#fridge_closed, #fridge_open");
                const doorGroup = fridgeRef.current.querySelector<SVGGElement>("#door, #door_closed, #door_open");
                if (fridgeGroup && doorGroup) {
                    setFridgeState("closed");
                    fridgeGroup.id = "fridge_closed";
                    doorGroup.id = "door_closed";
                }
            }
        }
        return () => {
            if (toggleTimerRef.current) {
                clearInterval(toggleTimerRef.current);
                toggleTimerRef.current = null;
            }
        };
    }, [isLoading]);

    return (
        <div className={`fridge_container ${isLoading ? 'loading' : ''}`}>
            <FridgeImageSVG
                ref={fridgeRef}
                width="100%"
                className="fridge_svg"
            />
        </div>
    );
};

export default Fridge;
