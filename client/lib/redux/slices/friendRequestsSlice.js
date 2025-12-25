import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { 
    insertRequest, 
    fetchFriendRequests, 
    supaDecideOnRequest,
} from '@/lib/client-actions';

export const sendRequest = createAsyncThunk(
    'friendRequests/sendRequest',
    async(requestInfo, thunkAPI) => {
        try {
            const { error } = await insertRequest(requestInfo);
            if(error) return thunkAPI.rejectWithValue(error);
        } catch(err) {
            return thunkAPI.rejectWithValue('Error Sending Request');
        }
    }
);

export const loadFriendRequests = createAsyncThunk(
    'friendRequests/loadFriendRequests',
    async(id, thunkAPI) => {
        //Fetch incoming and outgoing requests
        const { error, data } = await fetchFriendRequests(id);
        if(error) return thunkAPI.rejectWithValue(error);

        return data;
    }
);

export const decideOnRequest = createAsyncThunk(
    'friendRequests/decideOnRequest',
    async(decisionInfo, thunkAPI) => {
        const { requestID } = decisionInfo;
        try {
            const { error } = await supaDecideOnRequest(decisionInfo);
            if(error) return thunkAPI.rejectWithValue(error);
            return requestID;
        } catch(error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const friendRequestsSlice = createSlice({
    name: 'friendRequests',
    initialState: {
        incomingFriendRequests: [],
        outgoingFriendRequests: [],
        message: '',
        hasError: false,
        isLoading: false,
    },
    reducers: {
        setFriendRequestMessage: (state, action) => {
            state.message = action.payload
        },
        setHasFriendRequestError: (state, action) => {
            state.hasError = action.payload
        },
        setIsFriendRequestLoading: (state, action) => {
            state.isLoading = action.payload
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(sendRequest.pending, state => {
                state.isLoading = true;
                state.hasError = false;
                state.message = 'Sending...';
            })
            .addCase(sendRequest.fulfilled, state => {
                state.isLoading = false;
                state.hasError = false;
                state.message = 'Request Sent!';
            })
            .addCase(sendRequest.rejected, (state, action) => {
                state.isLoading = false;
                state.hasError = true;
                state.message = action.payload;
            })
            .addCase(loadFriendRequests.pending, state => {
                state.isLoading = true;
                state.hasError = false;
                state.message = '';
            })
            .addCase(loadFriendRequests.fulfilled, (state, action) => {
                state.isLoading = false;
                state.hasError = false;
                state.message = '';
                state.incomingFriendRequests = action.payload.incomingRequests;
                state.outgoingFriendRequests = action.payload.outgoingRequests;
            })
            .addCase(loadFriendRequests.rejected, (state, action) => {
                state.isLoading = false;
                state.hasError = true;
                state.message = action.payload;
            })
            .addCase(decideOnRequest.pending, state => {
                state.isLoading = true;
                state.hasError = false;
                state.message = '';
            })
            .addCase(decideOnRequest.fulfilled, (state, action) => {
                state.isLoading = false;
                state.hasError = false;
                state.message = '';
                state.incomingFriendRequests = state.incomingFriendRequests
                    .filter(request => request.id !== action.payload);
            })
            .addCase(decideOnRequest.rejected, (state, action) => {
                state.isLoading = false;
                state.hasError = true;
                state.message = action.payload;
            })
    }
})

export const {
    setIsFriendRequestLoading,
    setFriendRequestMessage,
    setHasFriendRequestError
} = friendRequestsSlice.actions;

export default friendRequestsSlice.reducer;