'use server';

import { createClient } from "@supabase/supabase-js";
import { use } from "react";

const supabaseAuth = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const supaInsert = async (userInfo) => {
    const { email, firstName, lastName, username } = userInfo;

    console.log('INSIDE SUPAINSERT');

    const { data, error } = await supabaseAdmin
        .from('users')
        .insert({
            email: email, 
            username: username, 
            'first_name': firstName, 
            'last_name': lastName
        })
        .single();
    console.log("INSERT RESULT", { data, error });
    if(error) {
        return {success: false, message: error.message};
    };

    return {success: true};;
}

export const supaSignup = async(userInfo) => {
    const { email, password, username } = userInfo;
    
    //Add user to db with provided info
    const inserted = await supaInsert(userInfo);
    if(!inserted.success) {
        if(inserted.message.includes('email')) {
            return {success: false, message: 'Email already in use'};
        }
        if(inserted.message.includes('username')) {
            return {success: false, message: 'Username already in use'};
        }
        return {success: false, message: inserted.message};
    }

    //Sign up user using provided email
    const { error } = await supabaseAuth.auth.signUp({email, password});
    if(error) return {success: false, message: error.message};

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
    const email = await supabaseAuth.from('users').select('email').eq('username', userID);
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

export const fetchSession = async() => {
    const { data } = await supabaseAuth.auth.getSession();
    return data.session;
}

export const supaDelete = async(email) => {
    const { data, error } = await supabaseAuth.auth.admin.deleteUser(email);

    if (error) {
        console.error(error)
        return { error }
    }

    return { data }
}