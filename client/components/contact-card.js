'use client';

import { useState, useEffect, useContext } from 'react';
import { SocketContext } from '@/lib/socket/socket';

import { useDispatch, useSelector } from 'react-redux';
import { loadMessages, setChattingWith, setCurrentConversationID, clearMessageLog, setShowNewMessagesPopUp } from '../lib/redux/slices/messagesSlice';

import styles from './contact-card.module.css';
import DefaultPFP from '@/app/(icons)/default_pfp.svg';

export default function ContactCard(props) {
    const { 
        username, 
        lastMessage, 
        conversationID, 
        scrollMessageThreadToBottom,
        pfpPath
    } = props;
    const socket = useContext(SocketContext);

    const [prevLastMessage, setPrevLastMessage] = useState(lastMessage);

    //Redux
    const dispatch = useDispatch();
    const session = useSelector(state => state.auth.session);
    const currentConversationID = useSelector(state => state.messages.currentConversationID);
    const messageLog = useSelector(state => state.messages.messageLog);
    
    //Load Conversation
    const loadConvo = async() => {
        //Clear old message log and load in new log
        dispatch(clearMessageLog());
        await dispatch(loadMessages({conversationID}));
        dispatch(setShowNewMessagesPopUp(false));

        //Leave the socket room if user is currently in one
        if(currentConversationID) socket.emit('leave_room', currentConversationID);
        //Join socket room for conversation
        socket.emit('join_room', conversationID);

        //Update the current conversation information
        dispatch(setChattingWith(username));
        dispatch(setCurrentConversationID(conversationID));
        console.log('Conversation ID: ', conversationID);
        console.log('Current Conversation ID: ', currentConversationID);
    }

    //Use Effect
    //Store previous last message (temp fix for no text image uploads)
    useEffect(() => {
        setPrevLastMessage(lastMessage);
    }, [lastMessage]);

    //Update last message when user receives message
    useEffect(() => {
        const handler = (lastMessageData) => {
            const { newLastMessage, conversationIDCheck } = lastMessageData;
            console.log('Update Convo: ', newLastMessage);
            console.log('ConvoID: ', conversationID);
            console.log('ConvoID Check: ', conversationIDCheck);
            if(conversationID === conversationIDCheck) {
                setPrevLastMessage(newLastMessage);
            }
        };

        socket.on('update_last_message', handler);

        return () => socket.off('update_last_message', handler);
    }, []);

    return(
        <div className={styles['contact-card']} onClick={loadConvo}>
            <div className={styles['pfp-container']}>
                {pfpPath ? 
                    <img 
                        src={pfpPath} 
                        className={styles.pfp}
                        alt={`${username}'s Profile Picture`} 
                    />
                    :
                    <DefaultPFP className={styles.pfp} />
                }
            </div>
            <div className={styles['contact-info']}>
                <h3>{username}</h3>
                {prevLastMessage ? 
                    <p>{prevLastMessage}</p>
                    :
                    <p>Send them a message!</p>
                }
            </div>
        </div>
    );
}