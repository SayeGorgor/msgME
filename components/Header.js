'use client';

import { useDispatch, useSelector } from 'react-redux';
import styles from './header.module.css';
import { 
    setShowLoginWindow, 
    setShowSignupWindow,
    setShowAccountOptionsWindow
} from '@/lib/redux/slices/headerSlice';

export default function Header() {
    //Redux
    const dispatch = useDispatch();
    const isAuthorized = useSelector(state => state.auth.isAuthorized);

    //Functions
    const summonIconPopup = (e) => {
        e.stopPropagation();
        dispatch(setShowAccountOptionsWindow(true));
    }

    return(
        <>
            {isAuthorized ? 
                <header className={styles['authorized-header-body']}>
                    <h3>msgME</h3>
                    <h2>Welcome, Saye</h2>
                    <div className={styles.icon} onClick={summonIconPopup}>
                        S
                    </div>
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
                    <div className={styles.icon} onClick={summonIconPopup}>
                        S
                    </div>
                </header>
            }
        </>
    );
}