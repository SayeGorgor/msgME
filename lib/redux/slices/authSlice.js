import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supaSignup, supaLogin, supaLogout } from "@/lib/actions";

export const signup = createAsyncThunk(
    'auth/signup',
    async(userInfo, thunkAPI) => {
        console.log('Starting Thunk');
        try {
            const userSignedUp = await supaSignup(userInfo);
            console.log('userSignedUp: ', userSignedUp.success);
            if(!userSignedUp.success) return thunkAPI.rejectWithValue(userSignedUp.message);
        } catch(err) {
            return thunkAPI.rejectWithValue('Error Signing User');
        }
    }
);

export const login = createAsyncThunk(
    'auth/login',
    async(credentials, thunkAPI) => {
        console.log('Credentials: ', credentials);
        const { userID, password } = credentials;
        console.log('User ID: ', userID);
        try {
            const userLoggedIn = await supaLogin(userID, password);
            if(!userLoggedIn.success) return thunkAPI.rejectWithValue(userLoggedIn.message);
        } catch(err) {
            return thunkAPI.rejectWithValue('Error Logging In User');
        }
    }
);

export const logout = createAsyncThunk(
    'auth/logout',
    async(thunkAPI) => {
        try {
            const res = await supaLogout();
        } catch(err) {
            return thunkAPI.rejectWithValue(err.response?.message || 'Error Logging Out');
        }
    }
)

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
    },
    extraReducers: (builder) => {
        builder
            .addCase(signup.pending, state => {
                state.isLoading = true;
                state.hasError - false;
                state.message = '';
            })
            .addCase(signup.fulfilled, state => {
                state.isLoading = false;
                state.hasError = false;
                state.message = '';
            })
            .addCase(signup.rejected, (state, action) => {
                state.isLoading = true;
                state.hasError = true;
                state.message = action.payload;
            })
            .addCase(login.pending, state => {
                state.isLoading = true;
                state.hasError - false;
                state.message = '';
            })
            .addCase(login.fulfilled, state => {
                state.isLoading = false;
                state.hasError = false;
                state.message = '';
                state.isAuthorized = true;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = true;
                state.hasError = true;
                state.message = action.payload;
            })
            .addCase(logout.pending, state => {
                state.isLoading = true;
                state.hasError - false;
                state.message = '';
            })
            .addCase(logout.fulfilled, state => {
                state.isLoading = false;
                state.hasError = false;
                state.message = '';
                state.isAuthorized = false;
            })
            .addCase(logout.rejected, (state, action) => {
                state.isLoading = true;
                state.hasError = true;
                state.message = action.payload;
            })
    }
});

export const {
    setIsAuthorized,
    setMessage,
    setIsLoading,
    setHasError
} = authSlice.actions;

export default authSlice.reducer;