import { createSlice } from "@reduxjs/toolkit"

export const headerSlice = createSlice({
    name: 'header',
    initialState: {
        showLoginWindow: false,
        showSignupWindow: false,
        showAccountOptionsWindow: false,
        showAddContactWindow: false
    },
    reducers: {
        setShowLoginWindow: (state, action) => {
            state.showLoginWindow = action.payload;
        },
        setShowSignupWindow: (state, action) => {
            state.showSignupWindow = action.payload;
        },
        setShowAccountOptionsWindow: (state, action) => {
            state.showAccountOptionsWindow = action.payload;
        },
        setShowAddContactWindow: (state, action) => {
            state.showAddContactWindow = action.payload;
        }
    }
});

export const {
    setShowLoginWindow,
    setShowSignupWindow,
    setShowAccountOptionsWindow,
    setShowAddContactWindow
} = headerSlice.actions;

export default headerSlice.reducer;