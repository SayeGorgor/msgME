'use client';

import { friendRequestSearch, searchByUsername } from '@/lib/client-actions';
import { useState } from 'react';
import styles from './add-friend-popup.module.css';

import { useDispatch, useSelector } from 'react-redux';
import { setShowAddContactWindow } from '@/lib/redux/slices/headerSlice';
import { sendRequest } from '@/lib/redux/slices/friendRequestsSlice';
import { setHomeMessage, setHasHomeError, setIsHomeLoading } from '@/lib/redux/slices/homeSlice';

import CloseWindowIcon from '@/app/(icons)/close_window_icon.svg';
import DefaultPFP from '@/app/(icons)/default_pfp.svg';

export default function AddFriendPopup() {
    //Use States
    const [username, setUsername] = useState('');
    const [userFound, setUserFound] = useState(false);
    const [foundUsername, setFoundUsername] = useState('');
    const [foundPfpPath, setFoundPfpPath] = useState('');
    const [userConfirmed, setUserConfirmed] = useState(false);

    //Redux
    const dispatch = useDispatch();
    const showAddContactWindow = useSelector(state => state.header.showAddContactWindow);
    const session = useSelector(state => state.auth.session);
    const isLoading = useSelector(state => state.home.isLoading);
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
        dispatch(setIsHomeLoading(true));
        dispatch(setHasHomeError(false));
        dispatch(setHomeMessage('Searching...'));
        const { success, data, error } = await friendRequestSearch(username);
        dispatch(setIsHomeLoading(false));
        if(!success) {
            dispatch(setHomeMessage(error));
            dispatch(setHasHomeError(true));
            return;
        }
        dispatch(setHomeMessage(''));
        setFoundUsername(data.username);
        setFoundPfpPath(data['pfp_path']);
        setUserFound(true);
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
                    <p className={`
                        ${styles.message} 
                        ${hasError ? styles.error : styles.success}
                        ${isLoading ? styles.loading : ''}
                    `}>
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
                                {foundPfpPath ? 
                                    <img 
                                        src={foundPfpPath}
                                        alt={`${foundUsername}'s Profile Picture`}
                                        className={styles.pfp}
                                    />
                                    :
                                    <DefaultPFP className={styles.pfp} />
                                }
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