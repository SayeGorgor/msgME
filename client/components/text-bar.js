'use client';

import { SocketContext } from '@/lib/socket/socket';
import { v4 as uuid } from 'uuid';

import { useState, useContext, useEffect, useRef } from 'react';
import styles from './text-bar.module.css';

import { useDispatch, useSelector } from 'react-redux';
import {  insertNewMessage } from '@/lib/redux/slices/messagesSlice';

import NewMessagePopUp from '@/components/new-message-popup';
import ImageIcon from '@/app/(icons)/image_icon.svg';
import CloseWindowIcon from '@/app/(icons)/close_window_icon.svg';


export default function TextBar({ scrollMessageThreadToBottom, preview, setPreview }) {
    const socket = useContext(SocketContext);

    //Refs
    const fileInputRef = useRef(null);
    const pendingMessageRef = useRef(null);

    //Redux
    const dispatch = useDispatch();
    const session = useSelector(state => state.auth.session);
    const currentConversationID = useSelector(state => state.messages.currentConversationID);

    //States
    const [newMessage, setNewMessage] = useState('');
    const [mediaPath, setMediaPath] = useState('');

    //Functions
    const sendMessage = async(e) => {
        e.preventDefault();
        if(newMessage || mediaPath) {
            const id = uuid();
            const message = {
                id,
                conversationID: currentConversationID,
                senderID: session?.user?.id,
                content: newMessage,
                timestamp: new Date().toISOString(),
                mediaPath
            };
            await dispatch(insertNewMessage(message));
            socket.emit('send_message', message);
            scrollMessageThreadToBottom();
            setNewMessage('');
            setPreview('');
            setMediaPath('');
        }
    }

    const uploadImage = async(e) => {
        const file = e.target.files[0];
        //Convert iphone images to jpeg
        if(file?.type === 'image/heic' || file?.name.endsWith('.heic')) {
            const convertedImage = await heicToJpeg(file);
            setMediaPath(convertedImage);
            setPreview(URL.createObjectURL(convertedImage));
        }

        //Set current media path to uploaded image if file is accepted
        if(file?.type === 'image/jpeg' || 
           file?.type === 'image/png' ||
           file?.type === 'image/webp') {
            setMediaPath(file);
            setPreview(URL.createObjectURL(file));
        }
    }

    //Use Effects
    //Dynamically resize pending message text area
    useEffect(() => {
        if(!pendingMessageRef.current) return;
    
        pendingMessageRef.current.style.height = 'auto';
        pendingMessageRef.current.style.height = `${pendingMessageRef.current.scrollHeight}px`;
    }, [newMessage]);

    return(
        <form 
            className={styles.body} 
            onSubmit={sendMessage}
        >
            <NewMessagePopUp />
            <div className={styles['content-section']}>
                <div className={`
                    ${styles['image-section']} 
                    ${preview ? styles['visible'] : ''}
                `}>
                    <div className={`
                        ${styles['image-container']} 
                        ${preview ? styles['visible'] : ''}
                    `}>
                        <div className={styles['close-window-icon']} onClick={() => setPreview('')}>
                            <CloseWindowIcon className={styles['close-window-icon-image']} />
                        </div>
                        <img src={preview || null} alt='uploaded-image' />
                    </div>
                </div>
                <textarea
                    type="text"
                    name="pending-message"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    ref={pendingMessageRef}
                    rows={1}
                    placeholder="Type Message..."
                    className={`
                        ${styles['content-input']}
                        ${preview ? styles['image-view'] : ''}
                        ${styles['mobile-view']}
                    `}
                />
            </div>
            <div 
                className={styles['image-icon-wrapper']} 
                onClick={() => fileInputRef.current.click()}
            >
                <input type='file' ref={fileInputRef} onChange={(e) => uploadImage(e)}/>
                <ImageIcon className={[styles['image-icon']]} />
            </div>
            <button type="submit">Send</button>
        </form>
    )
}