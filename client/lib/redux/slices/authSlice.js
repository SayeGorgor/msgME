import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supaSignup, supaLogout, supabaseAuth } from "@/lib/client-actions";
import { supaLogin } from "@/lib/server-actions";

export const signup = createAsyncThunk(
    'auth/signup',
    async(userInfo, thunkAPI) => {
        try {
            const userSignedUp = await supaSignup(userInfo);
            if(!userSignedUp.success) return thunkAPI.rejectWithValue(userSignedUp.message);
        } catch(err) {
            return thunkAPI.rejectWithValue('Error Signing User');
        }
    }
);

export const login = createAsyncThunk(
    'auth/login',
    async(credentials, thunkAPI) => {
        const { userID, password } = credentials;
        try {
            const userLoggedIn = await supaLogin(userID, password);
            if(!userLoggedIn.success) return thunkAPI.rejectWithValue(userLoggedIn.message);
        } catch(err) {
            return thunkAPI.rejectWithValue('Error Logging In User');
        }
    }
);

export const signInWithProvider = createAsyncThunk(
    'auth/signInWithProvider',
    async(provider, thunkAPI) => {
        try {
            const { error } = await supabaseAuth
                .auth
                .signInWithOAuth({
                    provider,
                    options: {
                        redirectTo: `${window.location.origin}/auth/v1/callback`,
                    }
                });
            if(error) {
                return thunkAPI.rejectWithValue(error);
            }
        } catch(error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
)

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
        hasError: false,
        user: '',
        userIDInput: '',
        passwordInput: '',
        session: {}
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
        },
        setUser: (state, action) => {
            state.user = action.payload;
        },
        setSession: (state, action) => {
            state.session = action.payload;
        },
        setUserIDInput: (state, action) => {
            state.userIDInput = action.payload;
        },
        setPasswordInput: (state, action) => {
            state.passwordInput = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(signup.pending, state => {
                state.isLoading = true;
                state.hasError = false;
                state.message = 'Loading...';
            })
            .addCase(signup.fulfilled, state => {
                state.isLoading = false;
                state.hasError = false;
                state.message = 'Sign Up Successful, Please Check Email for Confirmation';
            })
            .addCase(signup.rejected, (state, action) => {
                state.isLoading = false;
                state.hasError = true;
                state.message = action.payload;
            })
            .addCase(signInWithProvider.pending, state => {
                state.isLoading = true;
                state.hasError = false;
                state.message = '';
            })
            .addCase(signInWithProvider.fulfilled, state => {
                state.isLoading = false;
                state.hasError = false;
                state.message = '';
            })
            .addCase(signInWithProvider.rejected, (state, action) => {
                state.isLoading = false;
                state.hasError = true;
                state.message = action.payload;
            })
            .addCase(login.pending, state => {
                state.isLoading = true;
                state.hasError = false;
                state.message = 'Loading...';
            })
            .addCase(login.fulfilled, state => {
                state.isLoading = false;
                state.hasError = false;
                state.message = '';
                state.isAuthorized = true;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.hasError = true;
                state.message = action.payload;
            })
            .addCase(logout.pending, state => {
                state.isLoading = true;
                state.hasError = false;
                state.message = 'Loading...';
            })
            .addCase(logout.fulfilled, state => {
                state.isLoading = false;
                state.hasError = false;
                state.message = '';
                state.isAuthorized = false;
                state.user = '';
                state.userIDInput = '';
                state.passwordInput = '';
                state.session = {};
            })
            .addCase(logout.rejected, (state, action) => {
                state.isLoading = false;
                state.hasError = true;
                state.message = action.payload;
            })
    }
});

export const {
    setIsAuthorized,
    setMessage,
    setIsLoading,
    setHasError,
    setSession,
    setUser,
    setUserIDInput,
    setPasswordInput
} = authSlice.actions;

export default authSlice.reducer;