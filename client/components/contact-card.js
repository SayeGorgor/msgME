import { useDispatch } from 'react-redux';
import styles from './contact-card.module.css';
import DefaultPFP from '@/app/(icons)/default_pfp.svg';
import { setChattingWith } from '../lib/redux/slices/homeSlice';

export default function ContactCard({ username, latestMessage }) {
    const dispatch = useDispatch();
    //Load Conversation
    const loadConvo = () => {
        dispatch(setChattingWith(username));
    }
    return(
        <div className={styles['contact-card']} onClick={loadConvo}>
            <div className={styles['pfp-container']}>
                <DefaultPFP className={styles.pfp} />
            </div>
            <div className={styles['contact-info']}>
                <h3>{username}</h3>
                <p>{latestMessage}</p>
            </div>
        </div>
    );
}