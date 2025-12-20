import { createContext, useContext, useState } from "react";

interface IngredientProviderProps {
    children: React.ReactNode
}

const IngredientContext = createContext<string | undefined>(undefined);

const SetIngredientContext = createContext<any>(undefined)

export const IngredientProvider: React.FC<IngredientProviderProps> = ({children}) => {
    const [ingredient, setIngredient] = useState<string | undefined>("");
    
    return (
        <SetIngredientContext.Provider value={setIngredient}>
            <IngredientContext.Provider value={ingredient}>
                {children}
            </IngredientContext.Provider>
        </SetIngredientContext.Provider>
    )
}

export const useIngredient = () => {
    const context = useContext(IngredientContext);
    if (context === undefined) {
        throw new Error("useIngredient must be used with IngredientContext provider");
    }
    return context;
}

export const useSearch = () => {
    const context = useContext(SetIngredientContext);
    if (context === undefined) {
        throw new Error("useSearch Context must be used with setIngredient provider");
    }
    return context;
}