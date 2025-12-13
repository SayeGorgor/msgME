import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAccountData, supaUpdateAccountInfo } from "@/lib/client-actions";

export const loadAccountData = createAsyncThunk(
    'account/loadAccountData',
    async(userID, thunkAPI) => {
        try {
            const { success, data, error } = await fetchAccountData(userID);
            if(!success) return thunkAPI.rejectWithValue(error);

            return data
        } catch(error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const updateAccountInfo = createAsyncThunk(
    'account/updateAccountInfo',
    async(requestData, thunkAPI) => {
        console.log('Starting thunk');
        console.log('Account Request Data: ', requestData);
        const state = thunkAPI.getState();
        const { userID, info } = requestData;
        let newAccountInfo = {};

        //Filter out existing values
        console.log('Filling array');
        console.log('Info: ', info);
        for(let attribute in info) {
            console.log('Key: ', attribute);
            console.log('Value: ', info[attribute]);
            if(info[attribute] !== state.account.accountData[attribute]) {
                newAccountInfo = {
                    ...newAccountInfo,
                    [attribute]: info[attribute]
                }
            }
        }
        console.log('Said array', newAccountInfo);
        try {
            const { success, error, data } = await supaUpdateAccountInfo(userID, newAccountInfo);
            if(!success) return thunkAPI.rejectWithValue(error);
            if(data) newAccountInfo['pfp_path'] = data?.signedPFP;

            return newAccountInfo;
        } catch(error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
)

export const accountSlice = createSlice({
    name: 'account',
    initialState: {
        showWindow: false,
        accountData: {},
        isLoading: false,
        hasError: false,
        message: ''
    },
    reducers: {
        setShowAccountWindow: (state, action) => {
            state.showWindow = action.payload;
        },
        setAccountMessage: (state, action) => {
            state.message = action.payload;
        },
        setHasAccountError: (state, action) => {
            state.hasError = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadAccountData.pending, state => {
                state.isLoading = true;
                state.hasError = false;
                state.message = '';
            })
            .addCase(loadAccountData.fulfilled, (state, action) => {
                state.isLoading = false;
                state.hasError = false;
                state.message = ''
                state.accountData = action.payload;
            })
            .addCase(loadAccountData.rejected, (state, action) => {
                state.isLoading = false;
                state.hasError = true;
                state.message = action.payload;
            })
            .addCase(updateAccountInfo.pending, state => {
                state.isLoading = true;
                state.hasError = false;
                state.message = 'Saving Changes...';
            })
            .addCase(updateAccountInfo.fulfilled, (state, action) => {
                state.isLoading = false;
                state.hasError = false;
                state.message = 'Changes Saved!';
                state.accountData = {
                    ...state.accountData,
                    ...action.payload
                };
            })
            .addCase(updateAccountInfo.rejected, (state, action) => {
                state.isLoading = false;
                state.hasError = true;
                state.message = action.payload;
            })
    }
});

export const { 
    setShowAccountWindow, 
    setAccountMessage,
    setHasAccountError
} = accountSlice.actions;

export default accountSlice.reducer;