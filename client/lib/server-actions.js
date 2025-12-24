'use server';

import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const supabaseServer = async() => {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL, 
        process.env.NEXT_PUBLIC_SUPABASE_KEY,
        {
            cookies: {
                get(name) {
                    return cookieStore.get(name)?.value
                },
                set(name, value, options) {
                    cookieStore.set({ name, value, ...options })
                },
                remove(name, options) {
                    cookieStore.set({ name, value: '', ...options })
                },
            },
        }
    );
}

export const supaLogin = async(userID, password) => {
    const supabaseServerClient = await supabaseServer();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(userID);
    console.log('USer ID', userID);
    console.log('isEmail: ', isEmail);
    //Handle log in as normal if userID is an email
    if(isEmail) {
        const {error} = await supabaseServerClient
            .auth
            .signInWithPassword({email: userID, password});
        if(error) return {success: false, error: error.message};

        const { data: {user} } = await supabaseServerClient.auth.getUser()
        console.log('Auth Events: ', user);
        
        redirect('/');
    }

    //Grab email using userID
    const { data } = await supabaseServerClient
        .from('users')
        .select('email')
        .eq('username_lower', userID.trim().toLowerCase())
        .single();
    console.log('User Data: ', data);
    const email = data.email;
    //Fail if email isnt found
    if(!email) return {success: false, error: 'Username not found'};
    //Log in with found email
    const {error} = await supabaseServerClient.auth.signInWithPassword({email, password});
    if(error) return {success: false, error: error.message};

    redirect('/');
}

export const supaInsert = async (userInfo) => {
    const { email, firstName, lastName, username, id } = userInfo;

    console.log('INSIDE SUPAINSERT');

    const { data, error } = await supabase
        .from('users')
        .insert({
            id: id,
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

    return {success: true};
}

export const verifyNewUser = async(email, username) => {
    //Check if email is in use
    const { error:emailError } = await supabase.from('users').select('*').eq('email', email);
    console.log('Email Data: ', emailError);
    if(emailError) return {success: false, message: 'Email already in use!'}

    //Check if username is in use
    const { error:usernameError } = await supabase.from('users').select('*').eq('username', username);
    if(usernameError) return {success: false, message: 'Username already in use'}

    return {success: true}
}

export const supaDelete = async(email) => {
    const { data, error } = await supabase.auth.admin.deleteUser(email);

    if (error) {
        console.error(error)
        return { error }
    }

    return { data }
}