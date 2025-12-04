import { createSlice } from '@reduxjs/toolkit';

const homeSlice = createSlice({
    name: 'home',
    initialState: {
        chattingWith: ''
    },
    reducers: {
        setChattingWith: (state, action) => {
            state.chattingWith = action.payload;
        }
    }
});

export const { setChattingWith } = homeSlice.actions;

export default homeSlice.reducer;