'use client';

import { useEffect, useRef } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { setShowNotificationsWindow } from '@/lib/redux/slices/headerSlice';

import styles from './notifications-popup.module.css';

import PendingRequestCard from './pending-request-card';
import CloseWindowIcon from '@/app/(icons)/close_window_icon.svg';

export default function NotificationsPopup() {
    const popupRef = useRef(null);
    //Redux
    const dispatch = useDispatch();
    const showNotificationsWindow = useSelector(state => state.header.showNotificationsWindow);
    const incomingFriendRequests = useSelector(state => state.home.incomingFriendRequests);
    const outgoingFriendRequests = useSelector(state => state.home.outgoingFriendRequests);

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
                <CloseWindowIcon 
                    className={styles['close-window-icon']} 
                    onClick={() => dispatch(setShowNotificationsWindow(false))}
                />
                <h2>Pending Requests</h2>
                <ul className={styles['pending-requests-list']}>
                    {incomingFriendRequests.map(request => (
                        <li key={request.id}>
                            <PendingRequestCard 
                                requestID={request.id} 
                                username={request.senderUsername}
                                senderID={request.senderID}
                            />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}