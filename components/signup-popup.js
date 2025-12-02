'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './signup-popup.module.css';
import CloseWindowIcon from '@/app/(icons)/close_window_icon.svg';
import { setShowSignupWindow } from '@/lib/redux/slices/headerSlice';

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

    return(
        <>
            <div className={`${styles.body} ${showSignupWindow ? styles.visible : ''}`}>
                <CloseWindowIcon 
                    className={styles['close-window-icon']} 
                    onClick={() => dispatch(setShowSignupWindow(false))}
                />
                <h2>Sign Up</h2>
                <form className={styles['signup-form']}>
                    <div className={styles['name-fields']}>
                        <input 
                            type='text'
                            name='first-name'
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder='First Name'
                            autoComplete='given-name'
                        />
                        <input 
                            type='text'
                            name='last-name'
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder='Last Name'
                            autoComplete='family-name'
                        />
                    </div>
                    <input 
                        type='email'
                        name='email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder='Email'
                        autoComplete='email'
                    />
                    <input 
                        type='text'
                        name='username'
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder='Username'
                        autoComplete='username'
                    />
                    <input 
                        type='password'
                        name='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder='Password'
                        autoComplete='new-password'
                    />
                    <input 
                        type='password'
                        name='password-confirm'
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        placeholder='Confirm Password'
                        autoComplete='new-password'
                    />
                    <button type='submit'>Sign Up</button>
                </form>
            </div>
            <div 
                className={`
                    ${styles.overlay} 
                    ${showSignupWindow ? styles.visible : ''}
                `}
                onClick={() => dispatch(setShowSignupWindow(false))}
                inert={showSignupWindow ? false : true}
            ></div>
        </>
    )
}