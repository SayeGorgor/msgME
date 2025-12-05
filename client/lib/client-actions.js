'use client';

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
        const {error} = await supabaseAuth.auth.signInWithPassword({email: userID, password});
        if(error) return {success: false, message: error.message};

        return {success: true};
    }

    //Grab email using userID
    const res = await supabaseAuth.from('users').select('email').eq('username', userID).single();
    const email = res.email;
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

export const fetchContacts = async() => {
    let contacts = [];
    const { data, error } = await supabaseAuth.from('contacts').select('*');
    if(error) return { success: false, message: error.message };

    for(let row of data) {
        const { data:usernameData } = await supabaseAuth.from('users').select('username').eq('id', row['contact_id']).single();
        contacts.push({username: usernameData.username, id: row['contact_id']});
    }

    return { success: true, contacts };
}

export const searchByUsername = async(username) => {
    const { data, error } = await supabaseAuth.from('users').select('*').eq('username', username).single();
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
    if(data) return {success: false, error: 'You Are Already Friends With this User!'};
    
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
    }

    //Delete request from requests table
    const { error } = await supabaseAuth
        .from('requests')
        .delete('*')
        .eq('id', requestID)
        .single();
    if(error) return {error: 'Error Deleting User from DB'};

    return {success: true};
}