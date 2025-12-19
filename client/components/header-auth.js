'use client';

import { useDispatch, useSelector } from 'react-redux';
import { 
    setShowAccountOptionsWindow,
    setShowAddContactWindow,
    setShowNotificationsWindow
} from '@/lib/redux/slices/headerSlice';

import styles from './header-auth.module.css';
import NotificationIcon from '@/app/(icons)/notification_icon.svg';

export default function HeaderAuth() {
    //Redux
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth.user);
    const accountData = useSelector(state => state.account.accountData);
    const pfpPath = accountData['pfp_path'];

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
        <header className={styles.body}>
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
                    <div className={styles['pfp-container']} onClick={openIconPopup}>
                        {pfpPath ? 
                            <img 
                                src={pfpPath} 
                                className={styles.pfp} 
                                alt='User Profile Picture'
                            />
                            :
                            <p>{user.slice(0, 1).toUpperCase()}</p>
                        }
                    </div>
                </li>
            </ul>
        </header>
    )
}