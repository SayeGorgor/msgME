'use server';

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

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
    const { data, error } = await supabaseAuth.auth.admin.deleteUser(email);

    if (error) {
        console.error(error)
        return { error }
    }

    return { data }
}
