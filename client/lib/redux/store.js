import { configureStore } from "@reduxjs/toolkit";
import headerReducer from './slices/headerSlice';
import authReducer from './slices/authSlice';
import homeReducer from './slices/homeSlice';

export const store = configureStore({
    reducer: {
        header: headerReducer,
        auth: authReducer,
        home: homeReducer
    }
});