'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, setIsAuthorized } from '@/lib/redux/slices/authSlice';
import { setShowLoginWindow } from '@/lib/redux/slices/headerSlice';
import styles from './login-popup.module.css';
import CloseWindowIcon from '@/app/(icons)/close_window_icon.svg';
import GithubLogo from '@/app/(icons)/github_logo.svg';
import GoogleLogo from '@/app/(icons)/google_logo.svg';
import InstagramLogo from '@/app/(icons)/ig_logo.svg';
import { setHasError, setMessage } from '../lib/redux/slices/authSlice';

export default function LoginPopup() {
    //Redux
    const dispatch = useDispatch();
    const showLoginWindow = useSelector(state => state.header.showLoginWindow);
    const hasError = useSelector(state => state.auth.hasError);
    const message = useSelector(state => state.auth.message);

    //States
    const [userID, setuserID] = useState('');
    const [password, setPassword] = useState('');

    //Functions
    const closeLoginWindow = () => {
        dispatch(setShowLoginWindow(false));
        dispatch(setMessage(''));
        dispatch(setHasError(false));
        setuserID('');
        setPassword('');
    }

    const attemptLogin = (e) => {
        e.preventDefault();
        const credentials = {userID, password}
        dispatch(login(credentials))
        .then(res => {
            if(res.meta.requestStatus === 'fulfilled') {
                closeLoginWindow();
            }
        });
        setPassword('');
    }

    return(
        <>
            <div className={`${styles.body} ${showLoginWindow ? styles.visible : ''}`}>
                <CloseWindowIcon 
                    className={styles['close-window-icon']} 
                    onClick={closeLoginWindow}
                />
                <h2>Log In</h2>
                {message && 
                    <p className={`${styles.message} ${hasError ? styles.error : ''}`}>
                        {message}
                    </p>
                }
                <form className={styles['login-form']} onSubmit={attemptLogin}>
                    <input 
                        type='text'
                        name='user-id'
                        value={userID}
                        onChange={(e) => setuserID(e.target.value)}
                        placeholder='Email or Username'
                        autoComplete='username'
                    />
                    <input 
                        type='password'
                        name='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder='Password'
                        autoComplete='current-password'
                    />
                    <button type='submit'>Log In</button>
                </form>
                <div className={styles.divider}>
                    <hr />
                    <p>Or</p>
                    <hr />
                </div>
                <ul className={styles['external-login-options-list']}>
                    <li>
                        <div className={styles['external-login-option']}>
                            <GithubLogo className={styles.logo} />
                            <p>Sign in with Github</p>
                        </div>
                    </li>
                    <li>
                        <div className={styles['external-login-option']}>
                            <GoogleLogo className={styles.logo} />
                            <p>Sign in with Google</p>
                        </div>
                    </li>
                    <li>
                        <div className={styles['external-login-option']}>
                            <InstagramLogo className={styles.logo} />
                            <p>Sign in with Instagram</p>
                        </div>
                    </li>
                </ul>
            </div>
            <div 
                className={`
                    ${styles.overlay} 
                    ${showLoginWindow ? styles.visible : ''}
                `}
                onClick={closeLoginWindow}
                inert={showLoginWindow ? false : true}
            ></div>
        </>
    );
}