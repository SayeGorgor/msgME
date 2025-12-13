'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './manage-account-popup.module.css';

import { useDispatch, useSelector } from 'react-redux';
import { setAccountMessage, setHasAccountError, setShowAccountWindow } from '@/lib/redux/slices/accountSlice';
import { updateAccountInfo } from '@/lib/redux/slices/accountSlice';

import CloseWindowIcon from '@/app/(icons)/close_window_icon.svg';
import DefaultPFP from '@/app/(icons)/default_pfp.svg';

export default function ManageAccountPopup() {
    const fileInputRef = useRef(null);

    //Redux
    const dispatch = useDispatch();
    const session = useSelector(state => state.auth.session);
    const accountData = useSelector(state => state.account.accountData);
    const showAccountWindow = useSelector(state => state.account.showWindow);
    const hasAccountError = useSelector(state => state.account.hasError);
    const accountMessage = useSelector(state => state.account.message);
    const isLoading = useSelector(state => state.account.isLoading);

    //Use States
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [mediaPath, setMediaPath] = useState('');
    const [preview, setPreview] = useState('');

    //Functions
    const closeAccountWindow = () => {
        dispatch(setShowAccountWindow(false));
        dispatch(setAccountMessage(''));
        dispatch(setHasAccountError(false));
        setPreview('');
        setMediaPath('');
    }

    const updateInformation = (e) => {
        e.preventDefault();
        const userID = session?.user?.id;
        const info = {
            'first_name': firstName,
            'last_name': lastName,
            username
        }
        const requestData = {userID, info}
        dispatch(updateAccountInfo(requestData));
    }

    const uploadImage = (e) => {
        const file = e.target.files[0];
        if(file?.type === 'image/jpeg' || 
           file?.type === 'image/png' ||
           file?.type === 'image/webp'
        ) {
            setMediaPath(file);
            setPreview(URL.createObjectURL(file));
        }
    }

    //Use Effects
    //Reset data on when window is closed
    useEffect(() => {
        if(accountData) {
            setFirstName(accountData['first_name'] || '');
            setLastName(accountData['last_name'] || '');
            setEmail(accountData.email || '');
            setUsername(accountData.username || '');
        }
    }, [showAccountWindow]);

    //Set is editing to true while any value is different
    useEffect(() => {
        if(username === accountData.username &&
           firstName === accountData['first_name'] &&
           lastName === accountData['last_name']
        ) {
            setIsEditing(false);
        } else {
            setIsEditing(true);
        }
    }, [username, firstName, lastName, accountData]);

    return(
        <>
            <div className={`${styles.body} ${showAccountWindow ? styles.visible : ''}`}>
                <CloseWindowIcon 
                    className={styles['close-window-icon']} 
                    onClick={closeAccountWindow} 
                />
                <h2>Manage Account</h2>
                <div className={styles['pfp-container']}>
                    <button 
                        className={styles['add-pfp-btn']}
                        onClick={() => fileInputRef.current.click()}
                    >
                        +
                        <input 
                            type='file' 
                            onChange={(e) => uploadImage(e)}
                            ref={fileInputRef}
                        />
                    </button>
                    {preview ? 
                        <img src={preview} className={styles.pfp} />
                        :
                        <DefaultPFP className={styles.pfp} />
                    }
                </div>
                {accountMessage && 
                    <p className={`
                        ${styles.message} 
                        ${hasAccountError ? styles.error : styles.success}
                        ${isLoading ? styles.loading : ''}
                    `}>
                        {accountMessage}
                    </p>
                }
                <form className={styles['account-form']} onSubmit={updateInformation}>
                    <div className={styles['name-section']}>
                        <label>
                            First Name
                            <input 
                                type='text'
                                name='first_name'
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        </label>
                        <label>
                            Last Name
                            <input 
                                type='text'
                                name='last_name'
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </label>
                    </div>
                    <label>
                        Username
                        <input 
                            type='text'
                            name='username'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </label>
                    <label>
                        Email
                        <input 
                            type='email'
                            name='email'
                            value={email}
                            disabled
                        />
                    </label>
                    <button type='submit' disabled={!isEditing}>Save Changes</button>
                </form>
            </div>
            <div 
                className={`
                    ${styles.overlay} 
                    ${showAccountWindow ? styles.visible : ''}
                `}
                onClick={closeAccountWindow}
                inert={showAccountWindow ? false : true}
            ></div>
        </>
    );
}