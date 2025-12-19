import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/server-actions";
import HeaderAuth from "@/components/header-auth";

export default async function ProtectedLayout({ children }) {
    const supabase = await supabaseServer();

    const { data } = await supabase.auth.getUser();

    console.log('Data: ', data);

    if(!data.user) redirect('/auth'); 

    return(
        <>
            <HeaderAuth />
            {children}
        </>
    );
}