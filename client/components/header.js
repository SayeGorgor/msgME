'use client';

import { useDispatch, useSelector } from 'react-redux';
import { 
    setShowLoginWindow, 
    setShowSignupWindow,
    setShowAccountOptionsWindow,
    setShowAddContactWindow,
    setShowNotificationsWindow
} from '@/lib/redux/slices/headerSlice';

import styles from './header.module.css';

import NotificationIcon from '@/app/(icons)/notification_icon.svg';

export default function Header() {
    //Redux
    const dispatch = useDispatch();
    const isAuthorized = useSelector(state => state.auth.isAuthorized);
    const user = useSelector(state => state.auth.user);

    //Functions
    const openIconPopup = (e) => {
        e.stopPropagation();
        dispatch(setShowAccountOptionsWindow(true));
    }

    const openNotificationsPopup = (e) => {
        e.stopPropagation();
        dispatch(setShowNotificationsWindow(true));
    }

    return(
        <>
            {isAuthorized ? 
                <header className={styles['authorized-header-body']}>
                    <h3>msgME</h3>
                    <h2>Welcome, {user}</h2>
                    <ul className={styles['user-options-list']}>
                        <li>
                            <NotificationIcon 
                                className={styles['notification-icon']}
                                onClick={openNotificationsPopup}
                            />
                        </li>
                        <li>
                            <div 
                                className={styles['add-friend-btn']} 
                                onClick={() => dispatch(setShowAddContactWindow(true))}
                            >
                                Add Friend
                            </div>
                        </li>
                        <li>
                            <div className={styles['user-pfp']} onClick={openIconPopup}>
                                S
                            </div>
                        </li>
                    </ul>
                </header>
                :
                <header className={styles['unauthorized-header-body']}>
                    <h2>msgME</h2>
                    <ul className={styles['header-options-list']}>
                        <li>
                            <div 
                                className={styles['header-option']}
                                onClick={() => dispatch(setShowSignupWindow(true))}
                            >
                                Sign Up
                            </div>
                        </li>
                        <li>
                            <div 
                                className={styles['header-option']}
                                onClick={() => dispatch(setShowLoginWindow(true))}
                            >
                                Log In
                            </div>
                        </li>
                    </ul>
                </header>
            }
        </>
    );
}