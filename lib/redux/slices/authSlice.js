import { createSlice } from "@reduxjs/toolkit";

export const authSlice = createSlice({
    name: 'auth',
    initialState: {
        isAuthorized: false,
        message: '',
        isLoading: false,
        hasError: false
    },
    reducers: {
        setIsAuthorized: (state, action) => {
            state.isAuthorized = action.payload;
        },
        setMessage: (state, action) => {
            state.message = action.payload;
        },
        setIsLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setHasError: (state, action) => {
            state.hasError = action.payload;
        }
    }
});

export const {
    setIsAuthorized,
    setMessage,
    setIsLoading,
    setHasError
} = authSlice.actions;

export default authSlice.reducer;