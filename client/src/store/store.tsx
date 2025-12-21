import { configureStore } from "@reduxjs/toolkit";
import { languageSlice } from "./slices/language/LanguageSlice";
import { ingredientSlice } from "./slices/IngredientSlice";
import { pageSlice } from "./slices/PageSlice";

export const store = configureStore({
    reducer: {
        language: languageSlice.reducer,
        ingredient: ingredientSlice.reducer,
        page: pageSlice.reducer,
    }
})

export type RootState = ReturnType<typeof store.getState>;