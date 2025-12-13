import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
    insertRequest, 
    fetchFriendRequests, 
    fetchUsernameByID, 
    supaDecideOnRequest,
    supaInsertNewMessage, 
    fetchMessages,
    fetchContacts,
    fetchOlderMessages
} from '@/lib/client-actions';

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

export const loadContacts = createAsyncThunk(
    'home/loadContacts',
    async(userID, thunkAPI) => {
        try {
            const { data, error } = await fetchContacts(userID);
            if(error) return thunkAPI.rejectWithValue(error);

            return data;
        } catch(error) {
            return thunkAPI.rejectWithValue(error);
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
        const { content, senderID, id, timestamp, conversationID } = message;
        try {
            const { success, data, error } = await supaInsertNewMessage(message);
            if(!success) return thunkAPI.rejectWithValue(error);

            console.log('Returned Shit: ', content, senderID, id);
            return { 
                content, 
                id, 
                conversationID, 
                'created_at': timestamp, 
                'sender_id': senderID,
                ...(data && {'media_path': data})
             };
        } catch(error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const loadMessages = createAsyncThunk(
    'home/loadMessages',
    async(requestData, thunkAPI) => {
        const { conversationID, oldestMessageDate } = requestData;
        console.log('Request Data: ', conversationID, oldestMessageDate);
        try {
            const { success, error, data } = await fetchMessages(requestData);
            if(!success) return thunkAPI.rejectWithValue(error);

            const hasMore = (data.length > 30);
            if(hasMore) data.pop();
            console.log('Datau: ', data);
            const oldestDate = data[data.length - 1]['created_at'];

            return {log: data, hasMore, oldestDate, conversationID};
        } catch(error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const loadOlderMessages = createAsyncThunk(
    'loadOlderMessages',
    async(conversationID, thunkAPI) => {
        const state = thunkAPI.getState();
        try {
            const { success, data, error } = await fetchOlderMessages(conversationID, state.oldestLoadedMessageDate);
            if(!success) return thunkAPI.rejectWithValue(error);
        } catch(error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
)

const homeSlice = createSlice({
    name: 'home',
    initialState: {
        contacts: [],
        chattingWith: '',
        incomingFriendRequests: [],
        outgoingFriendRequests: [],
        currentConversationID: '',
        messageLog: [],
        hasMoreMessages: false,
        oldestLoadedMessageDate: '',
        preventAnimation: true,
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
        },
        setIsHomeLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setPreventAnimation: (state, action) => {
            state.preventAnimation = action.payload;
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
            .addCase(loadContacts.pending, state => {
                state.isLoading = true;
                state.hasError = false;
                state.message = 'Loading Contacts...';
            })
            .addCase(loadContacts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.hasError = false;
                state.message = '';
                state.contacts = action.payload;
            })
            .addCase(loadContacts.rejected, (state, action) => {
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
                state.messageLog = [action.payload, ...state.messageLog];
                for(let contact of state.contacts) {
                    if(contact.conversationID === action.payload.conversationID) {
                        contact['last_message'] = action.payload.content;
                        contact['last_message_at'] = action.payload.timestamp;
                    }
                }
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
                state.messageLog = [...state.messageLog, ...action.payload.log];
                state.oldestLoadedMessageDate = action.payload.oldestDate;
                state.hasMoreMessages = action.payload.hasMore;
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
    addMessage,
    setIsHomeLoading,
    setPreventAnimation
} = homeSlice.actions;

export default homeSlice.reducer;