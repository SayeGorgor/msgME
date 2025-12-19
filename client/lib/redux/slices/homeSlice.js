import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
    supaInsertNewMessage, 
    fetchMessages,
    fetchContacts,
    fetchOlderMessages
} from '@/lib/client-actions';

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
            const oldestDate = (data.length > 0) ? data[data.length - 1]['created_at'] : null;

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
        currentConversationID: '',
        messageLog: [],
        showNewMessagesPopUp: false,
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
        clearMessageLog: (state) => {
            state.messageLog = [];
        },
        addMessage: (state, action) => {
            state.messageLog = [action.payload, ...state.messageLog];
        },
        setIsHomeLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setPreventAnimation: (state, action) => {
            state.preventAnimation = action.payload;
        },
        clearHomeData: (state) => {
            state.contacts = [];
            state.chattingWith = ''
        },
        setShowNewMessagesPopUp: (state, action) => {
            state.showNewMessagesPopUp = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
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
    setPreventAnimation,
    clearHomeData,
    setShowNewMessagesPopUp
} = homeSlice.actions;

export default homeSlice.reducer;