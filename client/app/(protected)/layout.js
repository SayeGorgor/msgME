import { redirect } from "next/navigation";
import { readOnlySupabaseServer } from "@/lib/server-actions";
import HeaderAuth from "@/components/header-auth";

export default async function ProtectedLayout({ children }) {
    const supabase = await readOnlySupabaseServer();

    const { data, error } = await supabase.auth.getUser();

    console.log('Data: ', data);

    if(!data.user || error) redirect('/auth'); 

    return(
        <>
            <HeaderAuth />
            {children}
        </>
    );
}