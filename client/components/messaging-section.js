'use client';

import { SocketContext } from '@/lib/socket/socket';

import { useState, useEffect, useRef, useContext } from 'react'; 
import styles from './messaging-section.module.css';

import { useDispatch, useSelector } from 'react-redux';
import { 
    addMessage, 
    clearMessageLog, 
    loadMessages, 
    setChattingWith, 
    setCurrentConversationID, 
    setShowNewMessagesPopUp
} from '@/lib/redux/slices/messagesSlice';

import TextBar from './text-bar';
import MessageCard from '@/components/message-card';
import ContactsSection from './contacts-section';
import ShowContactsIcon from '@/app/(icons)/back_arrow_icon.svg';

export default function MessagingSection() {
    const socket = useContext(SocketContext);

    //Refs
    const threadRef = useRef(null);
    const threadSentinelRef = useRef(null);

    //Redux
    const dispatch = useDispatch();

    const user = useSelector(state => state.auth.user);

    const chattingWith = useSelector(state => state.messages.chattingWith);
    const contacts = useSelector(state => state.messages.contacts);
    const currentConversationID = useSelector(state => state.messages.currentConversationID);
    const messageLog = useSelector(state => state.messages.messageLog);
    const isLoading = useSelector(state => state.messages.isLoading);
    const hasMoreMessages = useSelector(state => state.messages.hasMoreMessages);
    const oldestLoadedMessageDate = useSelector(state => state.messages.oldestLoadedMessageDate);

    //States
    const [preview, setPreview] = useState('');
    const [initialMount, setInitialMount] = useState(true);

    //Functions
    const scrollMessageThreadToBottom = () => {
        if(!threadRef.current) return;    
        console.log(threadRef.current.scrollHeight)
        threadRef.current.scrollTo({top: threadRef.current.scrollHeight, behavior: 'auto'});
    }

    const closeNewMessagePopUp = (e) => {
        e.stopPropagation();
        dispatch(setShowNewMessagesPopUp(false));
    }
    
    const closeOutConversation = () => {
        dispatch(setChattingWith(''));
        dispatch(setCurrentConversationID(''));
        dispatch(clearMessageLog());
    }

    //Use Effect
    //Update message log when new message is received
    useEffect(() => {
        const handler = (messageData) => {
            console.log('Socket Message: ', messageData);
            dispatch(addMessage(messageData));
        }

        socket.on('received_message', handler);

        return () => socket.off('received_message', handler);
    }, [dispatch]);

    //Scroll Message Log to Bottom on Mount(handles refreshes)
    useEffect(() => {
        scrollMessageThreadToBottom();
    }, []);

    //Scroll Message Log to Bottom on Message Received If Near Bottom,
    //Otherwise Show New Messages Pop Up
    useEffect(() => {
        //Do nothing on first mount
        if(initialMount) {
            setInitialMount(false);
            return;
        }
    
        const thread = threadRef.current;
        if(!thread) return;
    
        const distanceToBottom = 
            thread.scrollHeight - thread.scrollTop - thread.clientHeight;
        if(distanceToBottom < 400) {
            scrollMessageThreadToBottom();
        } else {
            dispatch(setShowNewMessagesPopUp(true));
        }
    }, [messageLog]);

    //Clear Chatting With On Logout
    useEffect(() => {
        if(!user) {
            dispatch(setChattingWith(''));
            dispatch(clearMessageLog());
        }
    }, [user]);

    //Scroll thread to bottom when new conversation is loaded
    useEffect(() => {
        if(!currentConversationID) return;
        
        scrollMessageThreadToBottom();
    }, [currentConversationID])
    
    //Load older messages when near top of message thread
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if(entry.isIntersecting) {
                    console.log('Intersection Conditions Status: ', isLoading, hasMoreMessages);
                }
                if(entry.isIntersecting && !isLoading && hasMoreMessages) {
                    console.log('Intersection Conditions Found');
                    console.log('Current Conversation ID: ', currentConversationID);
                    dispatch(loadMessages({
                        conversationID: currentConversationID, 
                        oldestMessageDate: oldestLoadedMessageDate
                    }));
                }
            },
            {
                root: threadRef.current,
                rootMargin: '50px',
                threshold: 0
            }
        );
    
        if(threadSentinelRef.current) observer.observe(threadSentinelRef.current);
    
        return () => observer.disconnect();
    }, [hasMoreMessages, isLoading, currentConversationID]);

    return(
        <div className={styles.body}>
            {chattingWith ? (
                <>
                    <div className={styles['contact-banner']}>
                        <button 
                            className={`
                                ${styles['show-contacts-button']}
                                ${styles['mobile-view']}
                            `}
                            onClick={closeOutConversation}
                        >
                            <ShowContactsIcon className={styles['show-contacts-icon']}/>
                        </button>
                        <h2>{chattingWith}</h2>
                    </div>
                    <div 
                        className={styles['texts-section']} 
                        onScroll={closeNewMessagePopUp}
                        ref={threadRef}
                    >
                        <div ref={threadSentinelRef}></div>
                        <ul className={`
                                ${styles['message-thread']}
                                ${preview ? styles['image-view'] : ''}
                        `}>
                            {messageLog.slice().reverse().map(message =>(
                                <li key={message.id}>
                                    <MessageCard 
                                        messageObj={message}
                                        senderID={message['sender_id']} 
                                        content={message.content} 
                                        id={message.id} 
                                        timestamp={
                                            message['created_at'] ||
                                            message.timestamp
                                        }
                                        mediaPath={message['media_path']}
                                    />
                                </li>
                            ))}
                        </ul>
                        <div className={styles['message-buffer']}></div>
                    </div>
                    <TextBar 
                        preview={preview}
                        setPreview={setPreview}
                        scrollMessageThreadToBottom={scrollMessageThreadToBottom}
                    />
                </>
            )
            :
            contacts ? (
              <>
                    <div className={styles['contacts-section-smaller-view-wrapper']}>
                        <ContactsSection />
                    </div>
                    <div className={`
                        ${styles['welcome-text']}
                        ${styles['welcome-text-larger-view-wrapper']}
                    `}>
                        <h2>Welcome to msgME!</h2>
                        <p>Add friends or click on a friend to start messaging!</p>
                    </div>
                </>
            ) : (
                <div className={styles['welcome-text']}>
                    <h2>Welcome to msgME!</h2>
                    <p>Add friends or click on a friend to start messaging!</p>
                </div>
            )}
        </div>
    );
}