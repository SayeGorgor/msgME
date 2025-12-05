'use client';

import { useEffect, useRef } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { setShowNotificationsWindow } from '@/lib/redux/slices/headerSlice';

import styles from './notifications-popup.module.css';

import PendingRequestCard from './pending-request-card';

export default function NotificationsPopup() {
    const popupRef = useRef(null);
    //Redux
    const dispatch = useDispatch();
    const showNotificationsWindow = useSelector(state => state.header.showNotificationsWindow);

    //Use Effect
    //Close notification popup on ouside click and scroll
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if(popupRef.current && !popupRef.current.contains(e.target)) {
                dispatch(setShowNotificationsWindow(false));
            }
        }

        const handleScroll = () => {
            if(popupRef.current) {
                dispatch(setShowNotificationsWindow(false));
            }
        }

        if(showNotificationsWindow) {
            window.addEventListener('click', handleOutsideClick);
            window.addEventListener('scroll', handleScroll);
        }

        return () => {
            window.removeEventListener('click', handleOutsideClick);
            window.addEventListener('scroll', handleScroll);
        }
    }, [showNotificationsWindow]);

    return(
        <div 
            className={`${styles.body} ${showNotificationsWindow ? styles.visible : ''}`}
            ref={popupRef}
        >
            <div className={styles['pending-requests-section']}>
                <h2>Pending Requests</h2>
                <ul className={styles['pending-requests-list']}>
                    <li>
                        <PendingRequestCard />
                    </li>
                </ul>
            </div>
        </div>
    )
}