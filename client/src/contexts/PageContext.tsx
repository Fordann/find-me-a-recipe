import { createContext, useContext, useState } from "react";
type PageType = "home_page" 
                | "main_page" 
                | "favorites_page" 
                | "recipe_page";

interface PageProviderProps {
    children: React.ReactNode
}

const PageContext = createContext<PageType | undefined>(undefined);

const SetPageContext = createContext<any>(undefined)

export const NavigationProvider: React.FC<PageProviderProps> = ({children}) => {
    const [page, setPage] = useState<PageType | undefined>("home_page");
    
    return (
        <SetPageContext.Provider value={setPage}>
            <PageContext.Provider value={page}>
                {children}
            </PageContext.Provider>
        </SetPageContext.Provider>
    )
}

export const useCurrentPage = () => {
    const context = useContext(PageContext);
    if (context === undefined) {
        throw new Error("useCurrentPage must be used with PageContext provider");
    }
    return context;
}

export const useNavigation = () => {
    const context = useContext(SetPageContext);
    if (context === undefined) {
        throw new Error("useNavigation Context must be used with SetPage provider");
    }
    return context;
}