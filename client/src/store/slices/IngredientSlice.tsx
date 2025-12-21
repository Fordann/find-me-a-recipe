import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
    value: "",
}

export const ingredientSlice = createSlice({
    name: 'ingredient',
    initialState: initialState,
    reducers: {
        update: (state,  new_ingredient: PayloadAction<string>) => {
            state.value = new_ingredient.payload;
        }
    }
})

export const { update } = ingredientSlice.actions;