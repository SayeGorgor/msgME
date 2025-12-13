'use client';

import { v4 as uuid } from 'uuid';
import { createClient } from "@supabase/supabase-js";
import { supaInsert, verifyNewUser } from "./server-actions";

export const supabaseAuth = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_KEY);

export const supaSignup = async(userInfo) => {
    const { email, password, username } = userInfo;

    //Check if user info is already in use
    const checkNewUser = await verifyNewUser(email, username);
    if(!checkNewUser.success) return {success: false, message: checkNewUser.message};

    //Sign up user using provided email
    const { data, error } = await supabaseAuth.auth.signUp({email, password});
    if(error) return {success: false, message: error.message};
    
    //Add user to db with provided info
    const inserted = await supaInsert({...userInfo, id: data.user.id});
    if(!inserted.success) {
        if(inserted.message.includes('email')) {
            return {success: false, message: 'Email already in use'};
        }
        if(inserted.message.includes('username')) {
            return {success: false, message: 'Username already in use'};
        }
        return {success: false, message: inserted.message};
    }

    return {success: true};
}

export const supaLogin = async(userID, password) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(userID);
    console.log('USer ID', userID);
    console.log('isEmail: ', isEmail);
    //Handle log in as normal if userID is an email
    if(isEmail) {
        const {error} = await supabaseAuth
            .auth
            .signInWithPassword({email: userID, password});
        if(error) return {success: false, message: error.message};

        return {success: true};
    }

    //Grab email using userID
    const { data } = await supabaseAuth
        .from('users')
        .select('email')
        .eq('username_lower', userID.trim().toLowerCase())
        .single();
    console.log('User Data: ', data);
    const email = data.email;
    //Fail if email isnt found
    if(!email) return {success: false, message: 'Username not found'};
    //Log in with found email
    const {error} = await supabaseAuth.auth.signInWithPassword({email, password});
    if(error) return {success: false, message: error.message};

    return {success: true};
}

export const supaLogout = async() => {
    await supabaseAuth.auth.signOut();
}

const fetchConversationInfo = async(conversationID) => {
    const { data, error } = await supabaseAuth
        .from('conversations')
        .select('last_message_at, last_message')
        .eq('id', conversationID)
        .single();
    if(error) return {success: false, error: error.message};

    return {success: true, data};
}

export const fetchContacts = async(userID) => {
    let contacts = [];
    const { data, error } = await supabaseAuth.from('contacts').select('*');
    if(error) return { success: false, message: error.message };

    for(let row of data) {
        const { data:contactData, error:contactError } = await supabaseAuth
            .from('users')
            .select('username, pfp_path')
            .eq('id', row['contact_id'])
            .single();
        if(contactError) return({success: false, message: error.message});

        //Fetch conversation id
        const { data:conversationID, error:rpcError } = await supabaseAuth.rpc('fetch_conversation_id',
            {
                arg_user_id: userID,
                arg_contact_id: row['contact_id']
            }
        )
        if(rpcError) {
            console.log('RPC Error: ', rpcError.message);
            return {success: false, error: rpcError.message};
        }
        const { data: conversationData, error } = await fetchConversationInfo(conversationID);
        if(error) return {success:false, error}

        //Get signed pfp url if contact has one
        if(contactData['pfp_path']) {
            console.log('Contact PFP Path: ', contactData['pfp_path']);
            const { data:pfpData, error:pfpError } = await supabaseAuth.storage
                .from('user_pfps')
                .createSignedUrl(contactData['pfp_path'], 120);
            if(pfpError) return {success: false, error: pfpError.message};

            contactData['pfp_path'] = pfpData.signedUrl;
        }
        
        contacts.push({
            ...conversationData,
            ...contactData,
            id: row['contact_id'],
            conversationID
        });
    }

    return { success: true, data: contacts };
}

export const searchByUsername = async(username) => {
    const { data, error } = await supabaseAuth
        .from('users')
        .select('*')
        .eq('username', username)
        .single();
    if(error) return {success: false, message: 'User Not Found'}
    console.log('Function Data: ', data);

    return {success: true, data}
}

export const fetchUsername = async(email) => {
    const { data, error } = await supabaseAuth
    .from('users')
    .select('username')
    .eq('email', email)
    .single();
    
    if(error) return {success: false, message: error.message};

    return {success: true, username: data.username}
}

const fetchUserID = async(username) => {
    const { data, error } = await supabaseAuth
        .from('users')
        .select('id')
        .eq('username', username)
        .single();

    if(error) return {success: false, message: error.message}

    return {success: true, data: data.id};
}

const verifyNewRequest = async(senderID, receiverID) => {
    //Check if user has already sent out this request
    const { error:userDuplicateError } = await supabaseAuth
        .from('requests')
        .select('*')
        .eq('sender_id', senderID)
        .eq('receiver_id', receiverID)
        .single();

    if(!userDuplicateError) return {success: false, error: 'Request Already Sent'};

    //Check if the request receiver has already sent out a friend request
    const { error:receiverDuplicateError } = await supabaseAuth
        .from('requests')
        .select('*')
        .eq('sender_id', receiverID)
        .eq('receiver_id', senderID)
        .single();

    if(!receiverDuplicateError) return {success: false, error: 'User Has Already Requested You'};

    return {success: true};
}

export const insertRequest = async(requestInfo) => {
    const { senderID, username } = requestInfo;

    //Get receiver id from username
    const { data:receiverID } = await fetchUserID(username);

    //Verify sender and receiver ids are different(not sending request to self)
    if(senderID === receiverID) return {success: false, error: 'Cannot Send Request to Self'};

    //Verify user isnt already in friends list
    const { data } = await supabaseAuth
        .from('contacts')
        .select('*')
        .eq('contact_id', receiverID)
        .single();  
    if(data) return {success: false, error: 'You Are Already Friends With This User!'};
    
    //Verify request doesn't already exist
    const newRequestCheck = await verifyNewRequest(senderID, receiverID);
    if(!newRequestCheck.success) return {success: false, error: newRequestCheck.error};
    
    //Insert request
    const { error } = await supabaseAuth
        .from('requests')
        .insert({
            'sender_id': senderID,
            'receiver_id': receiverID
        })
        .single();
    if(error) return {success: false, error: error.message};

    return {success: true};
}

export const fetchFriendRequests = async(id) => {
    //Fetch incoming friend requests
    const { data:incomingRequests , error:incomingRequestsError } = await supabaseAuth
        .from('requests')
        .select('id, sender_id')
        .eq('receiver_id', id);
        
    if(incomingRequestsError) return {error: incomingRequestsError.message};

    //Fetch outgoing friend requests
    const { data:outgoingRequests , error:outgoingRequestsError } = await supabaseAuth
        .from('requests')
        .select('id, receiver_id')
        .eq('sender_id', id);
        
    if(outgoingRequestsError) return {error: outgoingRequestsError.message}
    
    return {data: {outgoingRequests, incomingRequests}};
}

export const fetchUsernameByID = async(id) => {
    const { data, error } = await supabaseAuth
        .from('users')
        .select('username')
        .eq('id', id)
        .single();
    
    if(error) return {error: error.message};

    return {data: {username: data.username}};
}

export const supaDecideOnRequest = async(decisionInfo) => {
    const { decision, senderID, receiverID, requestID } = decisionInfo;

    //Add friend if accepted
    if(decision === 'accept') {
        const { error: firstEntryError } = await supabaseAuth
            .from('contacts')
            .insert({
                'user_id': senderID,
                'contact_id': receiverID
            })
            .single();

        const { error: secondEntryError } = await supabaseAuth
            .from('contacts')
            .insert({
                'user_id': receiverID,
                'contact_id': senderID
            })
            .single();
        if(firstEntryError || secondEntryError) return {success: false, error: 'Error Adding Friend'}

        //Create conversation
        const { success, error:conversationError } = await createConversation(senderID, receiverID);
        if(!success) return {success: false, error: conversationError};
    }

    //Delete request from requests table
    const { error } = await supabaseAuth
        .from('requests')
        .delete('*')
        .eq('id', requestID)
        .single();
    if(error) return {success: false, error: 'Error Deleting User from DB'};

    return {success: true};
}

const createConversation = async(senderID, receiverID) => {
    const conversationID = uuid();

    //Create new conversation
    const { error:convoError } = await supabaseAuth
        .from('conversations')
        .insert({
            id: conversationID
        })
        .single();
    if(convoError) return {success: false, error: convoError.message};

    //Add sender to conversation
    const { error:senderError } = await supabaseAuth
        .from('conversation_participants')
        .insert({
            'conversation_id': conversationID,
            'user_id': senderID
        })
        .single();
    if(senderError) return {success: false, error: senderError.message};

    //Add receiver to conversation
    const { error:receiverError } = await supabaseAuth
        .from('conversation_participants')
        .insert({
            'conversation_id': conversationID,
            'user_id': receiverID
        })
        .single();
    if(receiverError) return {success: false, error: receiverError.message};

    return {success: true};
}

export const supaInsertNewMessage = async(message) => {
    let fileName = '';
    let newMediaPath = '';
    const { id, mediaPath, conversationID, senderID, content } = message;
    if(mediaPath) {
        const ext = mediaPath.name.split('.').pop();
        fileName = `${conversationID}.${crypto.randomUUID()}.${ext}`;

        console.log("Uploading with metadata:", {
            'conversation_id': conversationID,
            'sender_id': senderID
        });

        const { error:storageError } = await supabaseAuth.storage
            .from('message_media')
            .upload(fileName, mediaPath, {
                metadata: {
                    'conversation_id':conversationID,
                    'sender_id': senderID
                }    
            });
        if(storageError) {
            console.log('Store Error: ', storageError);
            return {success: false, error: storageError.message};
        }

        const { data:mediaPathData, error:mediaPathError } = await supabaseAuth.storage
            .from('message_media')
            .createSignedUrl(fileName, 120);

        newMediaPath = mediaPathData.signedUrl;
    }

    const payload = {
        id: id,
        'conversation_id': conversationID,
        'sender_id': senderID,
        content: content,
        ...(fileName && {'media_path': fileName})
    }

    const { error:messageError } = await supabaseAuth
        .from('messages')
        .insert(payload)
        .single();
    if(messageError) {
        console.log('Message Error: ', messageError);
        return {success: false, error: messageError.message}
    }

    const { error:conversationError } = await supabaseAuth
        .from('conversations')
        .update({
            'last_message': message.content,
            'last_message_at': message.timestamp
        })
        .eq('id', message.conversationID)
        .single();
    if(conversationError) {
        console.log('Conversation Error: ', conversationError);
        return {success: false, error: conversationError.message};
    }

    return {success: true, data: newMediaPath};
}

export const fetchMessages = async(requestInfo) => {
    const { conversationID, oldestMessageDate } = requestInfo;
    let data = [];

    if(oldestMessageDate) {
        const { data:messageData, error } = await supabaseAuth
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationID)
            .lt('created_at', oldestMessageDate)
            .order('created_at', {ascending: false})
            .limit(31);
        if(error) return {success: false, error: error.message};

        data = messageData;
    } else {
        const { data:messageData, error } = await supabaseAuth
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationID)
            .order('created_at', {ascending: false})
            .limit(31);
        if(error) return {success: false, error: error.message};

        data = messageData;
    }

    for(let message of data) {
         if(message['media_path']) {
            console.log('Image found')
            const { data:mediaPathData, error:mediaPathError } = await supabaseAuth.storage
                .from('message_media')
                .createSignedUrl(message['media_path'], 120);
            
            if(mediaPathError) console.log('Media Path Error: ', mediaPathError);
            console.log('Signed Url: ', mediaPathData.signedUrl);
            message['media_path'] = mediaPathData.signedUrl;
        }
    }

    return {success: true, data};
}

export const fetchOlderMessages = async(conversationID, oldestMessageDate) => {
    const { data, error } = supabaseAuth
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationID)
        .lt('created_at', oldestMessageDate)
        .order('created_at', {ascending: false})
        .limit(31);
    if(error) return {success: false, error: error.message};

    for(let message of data) {
        console.log('Message: ', message);
         if(message['media_path']) {
            console.log('Image found')
            const { data:mediaPathData, error:mediaPathError } = await supabaseAuth.storage
                .from('message_media')
                .createSignedUrl(message['media_path'], 120);
            
            if(error) console.log('Media Path Error: ', mediaPathError);
            console.log('Signed Url: ', mediaPathData.signedUrl);
            message['media_path'] = mediaPathData.signedUrl;
        }
    }

    return {success: true, data}
}

export const fetchAccountData = async(userID) => {
    const { data, error } = await supabaseAuth
        .from('users')
        .select('email, username, first_name, last_name, pfp_path')
        .eq('id', userID)
        .single();
    if(error) return {success: false, error: error.message};

    if(data['pfp_path']) {
        console.log('Path: ', data['pfp_path']);
        const { data:pfpPathData, error:pfpPathError } = await supabaseAuth.storage
            .from('user_pfps')
            .createSignedUrl(data['pfp_path'], 120);
        if(pfpPathError) return {success: false, error: pfpPathError.message}

        data['pfp_path'] = pfpPathData.signedUrl;
    }

    return {success: true, data};
}

const validateUsername = async(username) => {
    const { data, error } = await supabaseAuth
        .from('users')
        .select('*')
        .eq('username', username)
        .single();
    if(!error) return {success: false, error: 'Username already in use!'}

    return {success: true};
}

export const supaUpdateAccountInfo = async(userID, newAccountInfo) => {
    let signedPFP = '';
    console.log('New Account Info: ', newAccountInfo);
    const pfpPath = newAccountInfo['pfp_path'];
    
    if(pfpPath) {
        const ext = pfpPath.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${ext}`;

        const { error:storageError } = await supabaseAuth.storage
            .from('user_pfps')
            .upload(fileName, pfpPath);
        if(storageError) {
            console.log('Store Error: ', storageError);
            return {success: false, error: storageError.message};
        }

        const { data:pfpPathData, error:pfpPathError } = await supabaseAuth.storage
            .from('user_pfps')
            .createSignedUrl(fileName, 120);

        signedPFP = pfpPathData.signedUrl;
        newAccountInfo['pfp_path'] = fileName;
    }

    const { error:updateError } = await supabaseAuth
        .from('users')
        .update(newAccountInfo)
        .eq('id', userID)
        .single();
    if(updateError) return {success: false, error: updateError.message};

    return {
        success: true,
        ...(signedPFP && {data: {signedPFP}})
    };
}

export const supaVerifyNewUser = (userInfo) => {
    const { email, username } = userInfo;
    if(email) {
        const { error: emailError } =  supabaseAuth
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        if(emailError) return {success: true};
    }

    if(username) {
        const { error: usernameError } =  supabaseAuth
            .from('users')
            .select('*')
            .eq('username', username)
            .single();
        if(usernameError) return {success: true};
    }

    return {success: false};
}