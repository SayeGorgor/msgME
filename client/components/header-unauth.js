'use client';

import { useDispatch } from 'react-redux';
import { 
    setShowLoginWindow, 
    setShowSignupWindow,
} from '@/lib/redux/slices/headerSlice';

import styles from './header-unauth.module.css';

export default function HeaderUnAuth() {
    //Redux
    const dispatch = useDispatch();

    return(
        <header className={styles.body}>
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
    );
}