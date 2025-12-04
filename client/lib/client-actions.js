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
    console.log('Retrieved data: ', data);
    if(error) return { success: false, message: error.message };

    for(let row of data) {
        const { data:usernameData } = await supabaseAuth.from('users').select('username').eq('id', row['contact_id']).single();
        console.log('Username Data: ', usernameData);
        contacts.push({username: usernameData.username, id: row['contact_id']});
    }

    return { success: true, contacts };
}