import { Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from './page.module.css';
import { loadContacts } from "@/lib/redux/slices/messagesSlice";
import { supabaseAuth } from "@/lib/client-actions";

export default function Contacts() {
    const dispatch = useDispatch();
    const contacts = useSelector(state => state.home.contacts);

    const GetContacts = async() => {
        const { data:session } = await supabaseAuth.auth.getSession();

        if(session) await dispatch(loadContacts(session.user.id));

        return(
            <div className={styles['contacts-section']}>
                <h2>Contacts</h2>
                <ul className={styles['contact-list']}>
                    {contacts.map(contact => (
                        <li key={contact.id}>
                            <ContactCard 
                            username={contact.username} 
                            pfpPath={contact['pfp_path']}
                            lastMessage={contact['last_message']}
                            conversationID={contact.conversationID} 
                            scrollMessageThreadToBottom={scrollMessageThreadToBottom}
                            />
                        </li>
                    ))}
                </ul>
            </div>
        );
    }
    return(
        <div className={styles.body}>
            <h2>Contacts</h2>
            <Suspense fallback={<p>Loading...</p>}>
                <GetContacts />
            </Suspense>
        </div>
    );
}