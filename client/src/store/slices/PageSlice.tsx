import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type PageType = "home_page" 
                | "main_page" 
                | "favorites_page" 
                | "recipe_page";

interface PageState {
    value: PageType,
}   

const initialState: PageState = {
    value: "home_page"
}

const navigationMap: Record<PageType, PageType> = {
    home_page: "home_page",
    main_page: "main_page",
    favorites_page: "main_page",
    recipe_page: "favorites_page", 
};

export const pageSlice = createSlice({
    name: 'page',
    initialState: initialState,
    reducers: {
        navigate: (state, targetPage: PayloadAction<PageType>) => {
            state.value = targetPage.payload;
        },
        navigateBack: state => {
            state.value = navigationMap[state.value];
        },
    }
});

export const { navigate, navigateBack} = pageSlice.actions;