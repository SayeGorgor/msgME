'use client';

import { searchByUsername } from '@/lib/client-actions';
import { useState } from 'react';
import styles from './add-friend-popup.module.css';

import { useDispatch, useSelector } from 'react-redux';
import { setShowAddContactWindow } from '@/lib/redux/slices/headerSlice';

import CloseWindowIcon from '@/app/(icons)/close_window_icon.svg';
import DefaultPFP from '@/app/(icons)/default_pfp.svg';
import { setHomeMessage, setHasHomeError, sendRequest } from '@/lib/redux/slices/homeSlice';

export default function AddFriendPopup() {
    //Use States
    const [username, setUsername] = useState('');
    const [userFound, setUserFound] = useState(false);
    const [foundUsername, setFoundUsername] = useState('');
    const [userConfirmed, setUserConfirmed] = useState(false);

    //Redux
    const dispatch = useDispatch();
    const showAddContactWindow = useSelector(state => state.header.showAddContactWindow);
    const session = useSelector(state => state.auth.session);
    const hasError = useSelector(state => state.home.hasError);
    const homeMessage = useSelector(state => state.home.message);

    //Functions
    const closeWindow = () => {
        dispatch(setShowAddContactWindow(false));
        setUsername('');
        setUserFound(false);
        dispatch(setHasHomeError(false));
        dispatch(setHomeMessage(''));
    }

    const lookupUser = async(e) => {
        e.preventDefault();
        setUserFound(false);
        dispatch(setHasHomeError(false));
        dispatch(setHomeMessage('Searching...'));
        const res = await searchByUsername(username);
        console.log('New Res: ', res);
        if(!res.success) {
            dispatch(setHomeMessage(res.message));
            dispatch(setHasHomeError(true));
        } else {
            dispatch(setHomeMessage(''));
            setFoundUsername(res.data.username);
            setUserFound(true);
        }
    }

    const sendFriendRequest = () => {
        if(session) {
            const senderID = session.user.id;
            const requestInfo = {senderID, username: foundUsername};
            dispatch(sendRequest(requestInfo));
        }
    }

    return(
        <>
            <div className={`${styles.body} ${showAddContactWindow ? styles.visible : ''}`}>
                <CloseWindowIcon 
                    className={styles['close-window-icon']} 
                    onClick={closeWindow}
                />
                <h2>Add Friend</h2>
                {homeMessage && 
                    <p className={`${styles.message} ${hasError ? styles.error : ''}`}>
                        {homeMessage}
                    </p>
                }
                <form className={styles['add-contact-form']} onSubmit={lookupUser}>
                    <input 
                        type='text' 
                        name='username'
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder='Enter Username...'
                    />
                    <button type='submit' name='submit-btn'>Find User</button>
                </form>
                {userFound && (
                    <div className={styles['user-check-section']}>
                        <h3>Is This User Correct?</h3>
                        <div className={styles['user-card']}>
                            <div className={styles['pfp-container']}>
                                <DefaultPFP className={styles.pfp} />
                            </div>
                            <div className={styles['username']}>
                                <h4>{foundUsername}</h4>
                            </div>
                        </div>
                        <button 
                            className={styles['add-user-btn']}
                            onClick={sendFriendRequest}
                        >Yes, Send Request!</button>
                    </div>
                )}
            </div>
            <div 
                className={`
                    ${styles.overlay} 
                    ${showAddContactWindow ? styles.visible : ''}
                `}
                onClick={closeWindow}
                inert={showAddContactWindow ? false : true}
            ></div>
        </>
    )
}