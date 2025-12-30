'use client';

import { supabaseAuth, fetchUsername } from '@/lib/client-actions';
import { useRouter } from 'next/navigation';

import { useEffect, useRef } from "react";
import styles from "./page.module.css";

import { useDispatch } from "react-redux";
import { loadAccountData } from '@/lib/redux/slices/accountSlice';
import { loadFriendRequests } from '@/lib/redux/slices/friendRequestsSlice';
import { setShowLoginWindow } from '@/lib/redux/slices/headerSlice';
import { clearHomeData, loadContacts  } from '@/lib/redux/slices/messagesSlice';
import { 
    logout,
    setPasswordInput,
    setSession, 
    setUser, 
    setUserIDInput
} from "@/lib/redux/slices/authSlice";

import ContactsSection from '@/components/contacts-section';
import MessagingSection from '@/components/messaging-section';

export default function Home() {
    const router = useRouter();
    const threadRef = useRef(null);
    const dispatch = useDispatch();

    //Functions
    const scrollMessageThreadToBottom = () => {
        if(!threadRef.current) return;    
        threadRef.current.scrollTo({top: threadRef.current.scrollHeight, behavior: 'auto'});
    }

    //Use Effects
    //Grab session on load and auth change
    useEffect(() => {
        //Close login window and clear info on successful login
        dispatch(setShowLoginWindow(false));
        dispatch(setUserIDInput(''));
        dispatch(setPasswordInput(''));

        // Load initial session on first render
        supabaseAuth.auth.getSession().then(({ data, error }) => {
            if(error) {
                dispatch(logout());
                dispatch(clearHomeData());
                router.push('/auth');
                router.refresh();
            }

            const session = data.session;
            dispatch(setSession(session));
            //Fetch username
            fetchUsername(session.user.email)
            .then(res => {
                if(res.success) dispatch(setUser(res.username));
            });
            //Fetch Contacts
            dispatch(loadContacts(session.user.id));
            //Fetch friend requests
            dispatch(loadFriendRequests(session.user.id));
            //Fetch account data
            dispatch(loadAccountData(session.user.id));
        });
    }, []);

    return (
        <div className={styles.page}>
            <main className={styles['authorized-main']}>
                <div className={styles['contacts-section-larger-view-wrapper']}>
                    <ContactsSection scrollMessageThreadToBottom={scrollMessageThreadToBottom} />
                </div>
                <MessagingSection />
            </main>
        </div>
    );
}
