'use client';

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setShowAccountOptionsWindow } from '@/lib/redux/slices/headerSlice';
import styles from './icon-popup.module.css';
import { logout, setIsAuthorized } from '@/lib/redux/slices/authSlice';
import { setShowAccountWindow } from '@/lib/redux/slices/accountSlice';

export default function IconPopup() {
    const popupRef = useRef(null);

    //Redux
    const dispatch = useDispatch();
    const showAccountOptionsWindow = useSelector(state => state.header.showAccountOptionsWindow);

    //Functions
    const handleLogout = () => {
        dispatch(logout());
        dispatch(setShowAccountOptionsWindow(false));
    }

    const openManageAccountWindow = () => {
        dispatch(setShowAccountWindow(true));
        dispatch(setShowAccountOptionsWindow(false));
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
                <li 
                    className={styles['top-option']} 
                    onClick={openManageAccountWindow}
                >
                    Manage Account
                </li>
                <li className={styles['bottom-option']} onClick={handleLogout}>
                    Log Out
                </li>
            </ul>
        </div>
    )
}