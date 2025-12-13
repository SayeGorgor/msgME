'use client';

import { useContext } from 'react';
import { SocketContext } from '@/lib/socket/socket';

import { useDispatch, useSelector } from 'react-redux';
import { loadMessages, setChattingWith, setCurrentConversationID, clearMessageLog } from '../lib/redux/slices/homeSlice';

import styles from './contact-card.module.css';
import DefaultPFP from '@/app/(icons)/default_pfp.svg';

export default function ContactCard({ username, lastMessage, conversationID, scrollMessageThreadToBottom }) {
    const socket = useContext(SocketContext);

    //Redux
    const dispatch = useDispatch();
    const session = useSelector(state => state.auth.session);
    const currentConversationID = useSelector(state => state.home.currentConversationID);
    const messageLog = useSelector(state => state.home.messageLog);
    
    //Load Conversation
    const loadConvo = async() => {
        //Clear old message log and load in new log
        dispatch(clearMessageLog());
        await dispatch(loadMessages({conversationID}));
        console.log('Message Log: ', messageLog);
        console.log('User ID: ', session.user.id);

        //Leave the socket room if user is currently in one
        if(currentConversationID) socket.emit('leave_room', currentConversationID);
        //Join socket room for conversation
        socket.emit('join_room', conversationID);

        //Update the current conversation information
        dispatch(setChattingWith(username));
        await dispatch(setCurrentConversationID(conversationID));
        console.log('Conversation ID: ', conversationID);
        console.log('Current Conversation ID: ', currentConversationID);
        scrollMessageThreadToBottom();
    }

    return(
        <div className={styles['contact-card']} onClick={loadConvo}>
            <div className={styles['pfp-container']}>
                <DefaultPFP className={styles.pfp} />
            </div>
            <div className={styles['contact-info']}>
                <h3>{username}</h3>
                <p>{lastMessage}</p>
            </div>
        </div>
    );
}