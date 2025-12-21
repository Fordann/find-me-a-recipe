import { createSlice } from "@reduxjs/toolkit";
import { Language } from "./translation";

interface LanguageState {
    value: Language
}

const initialState: LanguageState = {
    value: 'fr'
}

export const languageSlice = createSlice({
    name: 'language',
    initialState: initialState,
    reducers: {
        switched: state => {
            if (state.value === 'fr') {
                state.value = 'en';
            } else {
                state.value = 'fr';
            }
        }, 
          
    }
})

export const { switched } = languageSlice.actions;

