import { createSlice } from "@reduxjs/toolkit"

export const headerSlice = createSlice({
    name: 'header',
    initialState: {
        showLoginWindow: false,
        showSignupWindow: false,
        showAccountOptionsWindow: false
    },
    reducers: {
        setShowLoginWindow: (state, actions) => {
            state.showLoginWindow = actions.payload;
        },
        setShowSignupWindow: (state, actions) => {
            state.showSignupWindow = actions.payload;
        },
        setShowAccountOptionsWindow: (state, actions) => {
            state.showAccountOptionsWindow = actions.payload;
        },
    }
});

export const {
    setShowLoginWindow,
    setShowSignupWindow,
    setShowAccountOptionsWindow
} = headerSlice.actions;

export default headerSlice.reducer;