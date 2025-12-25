'use client';

import { friendRequestSearch } from '@/lib/client-actions';
import { useState } from 'react';
import styles from './add-friend-popup.module.css';

import { useDispatch, useSelector } from 'react-redux';
import { setShowAddContactWindow } from '@/lib/redux/slices/headerSlice';
import { 
    sendRequest, 
    setHasFriendRequestError, 
    setIsFriendRequestLoading, 
    setFriendRequestMessage 
} from '@/lib/redux/slices/friendRequestsSlice';

import CloseWindowIcon from '@/app/(icons)/close_window_icon.svg';
import DefaultPFP from '@/app/(icons)/default_pfp.svg';

export default function AddFriendPopup() {
    //Use States
    const [username, setUsername] = useState('');
    const [userFound, setUserFound] = useState(false);
    const [foundUsername, setFoundUsername] = useState('');
    const [foundPfpPath, setFoundPfpPath] = useState('');

    //Redux
    const dispatch = useDispatch();
    const showAddContactWindow = useSelector(state => state.header.showAddContactWindow);
    const session = useSelector(state => state.auth.session);
    const isLoading = useSelector(state => state.friendRequests.isLoading);
    const hasError = useSelector(state => state.friendRequests.hasError);
    const message = useSelector(state => state.friendRequests.message);

    //Functions
    const closeWindow = () => {
        dispatch(setShowAddContactWindow(false));
        setUsername('');
        setUserFound(false);
        dispatch(setHasFriendRequestError(false));
        dispatch(setFriendRequestMessage(''));
    }

    const lookupUser = async(e) => {
        e.preventDefault();
        setUserFound(false);
        dispatch(setIsFriendRequestLoading(true));
        dispatch(setHasFriendRequestError(false));
        dispatch(setFriendRequestMessage('Searching...'));
        const { success, data, error } = await friendRequestSearch(username);
        dispatch(setIsFriendRequestLoading(false));
        if(!success) {
            dispatch(setFriendRequestMessage(error));
            dispatch(setHasFriendRequestError(true));
            return;
        }
        dispatch(setFriendRequestMessage(''));
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
                {message && 
                    <p className={`
                        ${styles.message} 
                        ${hasError ? styles.error : styles.success}
                        ${isLoading ? styles.loading : ''}
                    `}>
                        {message}
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