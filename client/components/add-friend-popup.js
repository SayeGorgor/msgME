'use client';

import { searchByUsername } from '@/lib/client-actions';
import { useState } from 'react';
import styles from './add-friend-popup.module.css';

import { useDispatch, useSelector } from 'react-redux';
import { setShowAddContactWindow } from '@/lib/redux/slices/headerSlice';

import CloseWindowIcon from '@/app/(icons)/close_window_icon.svg';
import DefaultPFP from '@/app/(icons)/default_pfp.svg';
import { setHasError, setMessage } from '@/lib/redux/slices/authSlice';

export default function AddFriendPopup() {
    //Use States
    const [username, setUsername] = useState('');
    const [userFound, setUserFound] = useState(false);
    const [foundUsername, setFoundUsername] = useState('');
    const [userConfirmed, setUserConfirmed] = useState(false);

    //Redux
    const dispatch = useDispatch();
    const showAddContactWindow = useSelector(state => state.header.showAddContactWindow);
    const message = useSelector(state => state.auth.message);
    const hasError = useSelector(state => state.auth.hasError);

    //Functions
    const closeWindow = () => {
        dispatch(setShowAddContactWindow(false));
        setUsername('');
        setUserFound(false);
        dispatch(setHasError(false));
        dispatch(setMessage(''));
    }

    const lookupUser = async(e) => {
        e.preventDefault();
        setUserFound(false);
        dispatch(setHasError(false));
        dispatch(setMessage('Searching...'));
        const res = await searchByUsername(username);
        console.log('New Res: ', res);
        if(!res.success) {
            dispatch(setMessage(res.message));
            dispatch(setHasError(true));
        } else {
            dispatch(setMessage(''));
            setFoundUsername(res.data.username);
            setUserFound(true);
        }
    }

    return(
        <>
            <div className={`${styles.body} ${showAddContactWindow ? styles.visible : ''}`}>
                <CloseWindowIcon 
                    className={styles['close-window-icon']} 
                    onClick={closeWindow}
                />
                <h2>Add Contact</h2>
                {message && 
                    <p className={`${styles.message} ${hasError ? styles.error : ''}`}>
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
                                <DefaultPFP className={styles.pfp} />
                            </div>
                            <div className={styles['username']}>
                                <h4>{foundUsername}</h4>
                            </div>
                        </div>
                        <button className={styles['add-user-btn']}>Yes, Send Request!</button>
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