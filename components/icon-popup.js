'use client';

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setShowAccountOptionsWindow } from '@/lib/redux/slices/headerSlice';
import styles from './icon-popup.module.css';
import { setIsAuthorized } from '@/lib/redux/slices/authSlice';

export default function IconPopup() {
    const popupRef = useRef(null);

    //Redux
    const dispatch = useDispatch();
    const showAccountOptionsWindow = useSelector(state => state.header.showAccountOptionsWindow);

    //Functions
    const logout = () => {
        dispatch(setShowAccountOptionsWindow(false));
        dispatch(setIsAuthorized(false));
    }

    //Effects
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if(popupRef.current && !popupRef.current.contains(e.target)) {
                dispatch(setShowAccountOptionsWindow(false));
            }
        }

        const handleScroll = () => {
            if(popupRef.current) {
                dispatch(setShowAccountOptionsWindow(false));
            }
        }

        if(showAccountOptionsWindow) {
            window.addEventListener('click', handleOutsideClick);
            window.addEventListener('scroll', handleScroll);
        }

        return () => {
            window.removeEventListener('click', handleOutsideClick);
            window.addEventListener('scroll', handleScroll);
        }
    }, [showAccountOptionsWindow]);

    return(
        <div 
            className={`${styles.body} ${showAccountOptionsWindow ? styles.visible : ''}`}
            ref={popupRef}
        >
            <ul className={styles['options-list']}>
                <li className={styles['top-option']}>
                    Manage Account
                </li>
                <li className={styles['bottom-option']} onClick={logout}>
                    Log Out
                </li>
            </ul>
        </div>
    )
}