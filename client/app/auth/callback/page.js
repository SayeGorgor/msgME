'use client';

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { supabaseAuth, supaVerifyNewUser } from "@/lib/client-actions";
import { setIsAuthorized, setSession } from "@/lib/redux/slices/authSlice";

export default function Callback() {
    const dispatch = useDispatch();

    useEffect(() => {
        const finishedLogin = async() => {
            const { data:{user}, error:userError } = await supabaseAuth.auth.getUser();
            const { data:session, error:sessionError } = await supabaseAuth.auth.getSession();

            if(!userError) {
                const { success } = await supaVerifyNewUser({email: user?.email});
                if(success) {
                    const fullName = user.user_metadata.full_name || '';
                    const [firstName, ...rest] = fullName.split(" ");
                    const lastName = rest.join(" ");
                    const username = `user${Math.floor(Math.random() * 900000 + 100000)}`;

                    await supabaseAuth
                        .from('users')
                        .upsert({
                            id: user.id,
                            email: user.email,
                            username,
                            'first_name': firstName,
                            'last_name': lastName ?? 'Smith'
                        });
                }
                dispatch(setSession(session));
                dispatch(setIsAuthorized(true));
            }
            window.location.href = '/';
        }

        finishedLogin();
    }, [])

    return <p>Loading...</p>;
}