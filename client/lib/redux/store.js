import { configureStore } from "@reduxjs/toolkit";
import headerReducer from './slices/headerSlice';
import authReducer from './slices/authSlice';
import messagesReducer from './slices/messagesSlice';
import accountReducer from './slices/accountSlice';
import friendRequestsReducer from "./slices/friendRequestsSlice";

export const store = configureStore({
    reducer: {
        header: headerReducer,
        auth: authReducer,
        messages: messagesReducer,
        account: accountReducer,
        friendRequests: friendRequestsReducer
    }
});