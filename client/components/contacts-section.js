'use client';

import { useSelector } from "react-redux";
import styles from './contacts-section.module.css';

import LoadingAnimation from '@/app/(icons)/animated_loading_icon.svg';
import ContactCard from "./contact-card";

export default function ContactsSection({ scrollMessageThreadToBottom }) {
    const contacts = useSelector(state => state.messages.contacts);
    const contactsLoading = useSelector(state => state.messages.contactsLoading);

    return(
        <div className={`${styles.body} ${styles['mobile-view']}`}>
            <h2>Contacts</h2>
            {contactsLoading ? 
                <LoadingAnimation className={styles['loading-animation']} />
                :
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
            }
        </div>
    );
}