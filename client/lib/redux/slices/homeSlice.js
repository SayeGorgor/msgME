import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
    insertRequest, 
    fetchFriendRequests, 
    fetchUsernameByID, 
    supaDecideOnRequest,
    supaInsertNewMessage, 
    fetchMessages
} from '@/lib/client-actions';
import { setHasError, setMessage } from './authSlice';

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
);

export const loadFriendRequests = createAsyncThunk(
    'home/loadFriendRequests',
    async(id, thunkAPI) => {
        let incomingFriendRequests = [];
        let outgoingFriendRequests = [];

        //Fetch incoming and outgoing requests
        const { error, data } = await fetchFriendRequests(id);
        if(error) return thunkAPI.rejectWithValue(error);

        //Filter through incoming requests to grab username and add to list
        for(let request of data.incomingRequests) {
            console.log('Sender ID: ', request['sender_id']);
            const { data, error } = await fetchUsernameByID(request['sender_id']);
            if(error) {
                console.log('Filtering Error In Incoming: ', error);
                return thunkAPI.rejectWithValue(error);
            }
            incomingFriendRequests.push({
                id: request.id, 
                senderUsername: data.username,
                senderID: request['sender_id']
            });
        }

        //Filter through outgoing requests to grab username and add to list
        for(let request of data.outgoingRequests) {
            const { data, error } = await fetchUsernameByID(request['receiver_id']);
            if(error) return thunkAPI.rejectWithValue(error);
            outgoingFriendRequests.push({id: request.id, receiverUsername: data.username});
        }

        return {incomingFriendRequests, outgoingFriendRequests};
    }
);

export const decideOnRequest = createAsyncThunk(
    'home/decideOnRequest',
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

export const insertNewMessage = createAsyncThunk(
    'home/insertNewMessage',
    async(message, thunkAPI) => {
        const { content, senderID, id } = message;
        try {
            const { success, error } = await supaInsertNewMessage(message);
            if(!success) return thunkAPI.rejectWithValue(error);

            console.log('Returned Shit: ', content, senderID, id);
            return { content, id, 'sender_id': senderID };
        } catch(error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const loadMessages = createAsyncThunk(
    'home/loadMessages',
    async(conversationID, thunkAPI) => {
        try {
            const { success, error, data } = await fetchMessages(conversationID);
            if(!success) return thunkAPI.rejectWithValue(error);

            return data;
        } catch(error) {
            thunkAPI.rejectWithValue(error);
        }
    }
);

const homeSlice = createSlice({
    name: 'home',
    initialState: {
        chattingWith: '',
        incomingFriendRequests: [],
        outgoingFriendRequests: [],
        currentConversationID: '',
        messageLog: [],
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
        },
        setCurrentConversationID: (state, action) => {
            state.currentConversationID = action.payload;
        },
        clearMessageLog: (state, action) => {
            state.messageLog = [];
        },
        addMessage: (state, action) => {
            state.messageLog = [...state.messageLog, action.payload];
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
                state.message = 'Loading Requests...';
            })
            .addCase(loadFriendRequests.fulfilled, (state, action) => {
                state.isLoading = false;
                state.hasError = false;
                state.message = '';
                state.incomingFriendRequests = action.payload.incomingFriendRequests;
                state.outgoingFriendRequests = action.payload.outgoingFriendRequests;
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
            .addCase(insertNewMessage.pending, state => {
                state.isLoading = true;
                state.hasError = false;
                state.message = '';
            })
            .addCase(insertNewMessage.fulfilled, (state, action) => {
                state.isLoading = false;
                state.hasError = false;
                state.message = '';
                state.messageLog = [...state.messageLog, action.payload];
            })
            .addCase(insertNewMessage.rejected, (state, action) => {
                state.isLoading = false;
                state.hasError = true;
                state.message = action.payload;
            })
            .addCase(loadMessages.pending, state => {
                state.isLoading = true;
                state.hasError = false;
                state.message = 'Loading Messages...';
            })
            .addCase(loadMessages.fulfilled, (state, action) => {
                state.isLoading = false;
                state.hasError = false;
                state.message = '';
                state.messageLog = action.payload;
            })
            .addCase(loadMessages.rejected, (state, action) => {
                state.isLoading = false;
                state.hasError = true;
                state.message = action.payload;
            })
    }
});

export const { 
    setChattingWith, 
    setHomeMessage, 
    setHasHomeError,
    setCurrentConversationID,
    clearMessageLog,
    addMessage
} = homeSlice.actions;

export default homeSlice.reducer;