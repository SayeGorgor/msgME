'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './signup-popup.module.css';
import CloseWindowIcon from '@/app/(icons)/close_window_icon.svg';
import { setShowSignupWindow } from '@/lib/redux/slices/headerSlice';
import { setMessage, signup } from '@/lib/redux/slices/authSlice';

import { supaSignup } from '@/lib/actions';

export default function SignupPopup() {
    //States
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');

    //Redux
    const dispatch = useDispatch();
    const showSignupWindow = useSelector(state => state.header.showSignupWindow);
    const message = useSelector(state => state.auth.message);

    //Functions
    const closeWindow = () => {
        setEmail('');
        setUsername('');
        setFirstName('');
        setLastName('');
        setPassword('');
        setPasswordConfirm('');
        dispatch(setShowSignupWindow(false))
    }

    const attemptSignUp = async(e) => {
        e.preventDefault();
        console.log('Attempting Sign Up');
        if(password !== passwordConfirm) {
            dispatch(setMessage('Passwords must match!'));
        } else {
            const userInfo = {email, username, firstName, lastName, password}
            dispatch(signup(userInfo))
            .then(res => {
                console.log('Status: ', res.meta.requestStatus);
                if(res.meta.requestStatus === 'fulfilled') {
                    closeWindow();
                }
            });
        }
    }

    return(
        <>
            <div className={`${styles.body} ${showSignupWindow ? styles.visible : ''}`}>
                <CloseWindowIcon 
                    className={styles['close-window-icon']} 
                    onClick={closeWindow}
                />
                <h2>Sign Up</h2>
                {message && <p className={styles['error-message']}>{message}</p>}
                <form className={styles['signup-form']} onSubmit={attemptSignUp}>
                    <div className={styles['name-fields']}>
                        <input 
                            type='text'
                            name='first-name'
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder='First Name'
                            autoComplete='given-name'
                            required
                        />
                        <input 
                            type='text'
                            name='last-name'
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder='Last Name'
                            autoComplete='family-name'
                            required
                        />
                    </div>
                    <input 
                        type='email'
                        name='email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder='Email'
                        autoComplete='email'
                        required
                    />
                    <input 
                        type='text'
                        name='username'
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder='Username'
                        autoComplete='username'
                        required
                    />
                    <input 
                        type='password'
                        name='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder='Password'
                        autoComplete='new-password'
                        required
                    />
                    <input 
                        type='password'
                        name='password-confirm'
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        placeholder='Confirm Password'
                        autoComplete='new-password'
                        required
                    />
                    <button type='submit'>Sign Up</button>
                </form>
            </div>
            <div 
                className={`
                    ${styles.overlay} 
                    ${showSignupWindow ? styles.visible : ''}
                `}
                onClick={closeWindow}
                inert={showSignupWindow ? false : true}
            ></div>
        </>
    )
}