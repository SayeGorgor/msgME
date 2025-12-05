import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { insertRequest } from '@/lib/client-actions';
import { setHasError } from './authSlice';

export const sendRequest = createAsyncThunk(
    'home/sendRequest',
    async(requestInfo, thunkAPI) => {
        try {
            const { error } = await insertRequest(requestInfo);
            if(error) return thunkAPI.rejectWithValue(error);
        } catch(err) {
            return thunkAPI.rejectWithValue('Error Sending Request');
        }
    }
)
const homeSlice = createSlice({
    name: 'home',
    initialState: {
        chattingWith: '',
        isLoading: false,
        hasError: false,
        message: ''
    },
    reducers: {
        setChattingWith: (state, action) => {
            state.chattingWith = action.payload;
        },
        setHomeMessage: (state, action) => {
            state.message = action.payload;
        },
        setHasHomeError: (state, action) => {
            state.hasError = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(sendRequest.pending, state => {
                state.isLoading = true;
                state.hasError = false;
                state.message = 'Loading...';
            })
            .addCase(sendRequest.fulfilled, state => {
                state.isLoading = false;
                state.hasError = false;
                state.message = '';
            })
            .addCase(sendRequest.rejected, (state, action) => {
                state.isLoading = false;
                state.hasError = true;
                state.message = action.payload;
            })
    }
});

export const { setChattingWith, setHomeMessage, setHasHomeError } = homeSlice.actions;

export default homeSlice.reducer;