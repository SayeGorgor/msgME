import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/server-actions";
import { cookies } from "next/headers";
// import { supabaseAuth } from "@/lib/client-actions";

export default async function ProtectedLayout({ children }) {
    const supabase = await supabaseServer();

    const { data } = await supabase.auth.getUser();
    // setTimeout(() => {
    //     console.log('Data: ', user);
    // }, 2000);
    console.log('Data: ', data);

    // if(!user) redirect('/auth');
    // if(!user) {
    //     await setTimeout(() => {
    //         if(!user) redirect('/auth');
    //     }, 0); 
    // }
    if(!data.user) redirect('/auth'); 

    return(<>{children}</>)
}